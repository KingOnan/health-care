# 데모 계정 + 샘플 데이터(영양제/약 5개씩, 최근 50일치 복용 기록/혈압/혈당) 시딩 스크립트
# 실행: backend 폴더에서 `python -m scripts.seed_demo`
import asyncio
import random
from datetime import date, datetime, time, timedelta

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import SessionLocal
from app.models.blood_pressure_record import BloodPressureRecord
from app.models.blood_sugar_record import BloodSugarRecord
from app.models.enums import CheckStatus, CheckTiming, EatStatus, EatTiming
from app.models.medication_item import MedicationItem
from app.models.medication_log import MedicationLog
from app.models.medication_schedule import MedicationSchedule
from app.models.supplement_item import SupplementItem
from app.models.supplement_log import SupplementLog
from app.models.supplement_schedule import SupplementSchedule
from app.models.user import User
from app.security import hash_password

DEMO_USER_ID = "demo"
DEMO_PASSWORD = "demo1234"
DEMO_USER_NAME = "데모"
SAMPLE_DAYS = 50

SUPPLEMENT_SAMPLES = [
    {
        "name": "오메가3",
        "product_name": "프로메가 알티지오메가3 1200mg",
        "company_name": "종근당건강",
        "timing": EatTiming.AFTER,
        "scheduled_time": time(8, 0),
    },
    {
        "name": "비타민D",
        "product_name": "비타민D 2000IU",
        "company_name": "고려은단",
        "timing": EatTiming.AFTER,
        "scheduled_time": time(8, 0),
    },
    {
        "name": "루테인",
        "product_name": "루테인 지아잔틴 콤플렉스",
        "company_name": "안국건강",
        "timing": EatTiming.AFTER,
        "scheduled_time": time(19, 0),
    },
    {
        "name": "마그네슘",
        "product_name": "마그네슘 비타민B6",
        "company_name": "뉴트리원",
        "timing": EatTiming.BEFORE,
        "scheduled_time": time(21, 0),
    },
    {
        "name": "유산균",
        "product_name": "장 건강 프로바이오틱스",
        "company_name": "쎌바이오텍",
        "timing": EatTiming.EMPTY,
        "scheduled_time": time(7, 30),
    },
]

MEDICATION_SAMPLES = [
    {
        "name": "혈압약",
        "product_name": "노바스크정 5mg",
        "company_name": "한국화이자제약",
        "timing": EatTiming.AFTER,
        "scheduled_time": time(8, 0),
        "is_prescription": True,
    },
    {
        "name": "당뇨약",
        "product_name": "글루코파지정 500mg",
        "company_name": "머크",
        "timing": EatTiming.AFTER,
        "scheduled_time": time(8, 0),
        "is_prescription": True,
    },
    {
        "name": "고지혈증약",
        "product_name": "리피토정 10mg",
        "company_name": "한국화이자제약",
        "timing": EatTiming.AFTER,
        "scheduled_time": time(19, 0),
        "is_prescription": True,
    },
    {
        "name": "진통제",
        "product_name": "타이레놀정 500mg",
        "company_name": "한국얀센",
        "timing": EatTiming.AFTER,
        "scheduled_time": time(13, 0),
        "is_prescription": False,
    },
    {
        "name": "위장약",
        "product_name": "겔포스엠",
        "company_name": "보령제약",
        "timing": EatTiming.BEFORE,
        "scheduled_time": time(19, 0),
        "is_prescription": False,
    },
]


# 기존 데모 계정과 딸린 데이터를 전부 삭제 (자식 테이블부터 역순으로)
async def delete_existing_demo(db: AsyncSession) -> None:
    existing_user = await db.scalar(select(User).where(User.user_id == DEMO_USER_ID))
    if existing_user is None:
        return

    supplement_item_seqs = (
        await db.scalars(
            select(SupplementItem.supplement_item_seq).where(SupplementItem.user_seq == existing_user.user_seq)
        )
    ).all()
    supplement_schedule_seqs = (
        await db.scalars(
            select(SupplementSchedule.supplement_schedule_seq).where(
                SupplementSchedule.supplement_item_seq.in_(supplement_item_seqs)
            )
        )
    ).all()
    medication_item_seqs = (
        await db.scalars(
            select(MedicationItem.medication_item_seq).where(MedicationItem.user_seq == existing_user.user_seq)
        )
    ).all()
    medication_schedule_seqs = (
        await db.scalars(
            select(MedicationSchedule.medication_schedule_seq).where(
                MedicationSchedule.medication_item_seq.in_(medication_item_seqs)
            )
        )
    ).all()

    await db.execute(delete(SupplementLog).where(SupplementLog.supplement_schedule_seq.in_(supplement_schedule_seqs)))
    await db.execute(delete(SupplementSchedule).where(SupplementSchedule.supplement_item_seq.in_(supplement_item_seqs)))
    await db.execute(delete(SupplementItem).where(SupplementItem.user_seq == existing_user.user_seq))

    await db.execute(delete(MedicationLog).where(MedicationLog.medication_schedule_seq.in_(medication_schedule_seqs)))
    await db.execute(delete(MedicationSchedule).where(MedicationSchedule.medication_item_seq.in_(medication_item_seqs)))
    await db.execute(delete(MedicationItem).where(MedicationItem.user_seq == existing_user.user_seq))

    await db.execute(delete(BloodPressureRecord).where(BloodPressureRecord.user_seq == existing_user.user_seq))
    await db.execute(delete(BloodSugarRecord).where(BloodSugarRecord.user_seq == existing_user.user_seq))
    await db.execute(delete(User).where(User.user_seq == existing_user.user_seq))
    await db.commit()


# 데모 계정 1개 + 영양제/약 각 5개 + 최근 50일치 복용 기록/혈압/혈당 샘플 데이터 생성
async def seed_demo() -> None:
    async with SessionLocal() as db:
        await delete_existing_demo(db)

        demo_user = User(
            user_id=DEMO_USER_ID,
            user_password=hash_password(DEMO_PASSWORD),
            user_name=DEMO_USER_NAME,
            is_demo=True,
        )
        db.add(demo_user)
        await db.flush()

        today = date.today()

        for sample in SUPPLEMENT_SAMPLES:
            item = SupplementItem(
                user_seq=demo_user.user_seq,
                name=sample["name"],
                product_name=sample["product_name"],
                company_name=sample["company_name"],
                timing=sample["timing"],
                status=EatStatus.ING,
            )
            db.add(item)
            await db.flush()

            schedule = SupplementSchedule(
                supplement_item_seq=item.supplement_item_seq,
                scheduled_time=sample["scheduled_time"],
            )
            db.add(schedule)
            await db.flush()

            for day_offset in range(SAMPLE_DAYS):
                log_date = today - timedelta(days=day_offset)
                status = random.choices(
                    [CheckStatus.DONE, CheckStatus.SKIPPED, CheckStatus.UNCHECKED],
                    weights=[85, 10, 5],
                )[0]
                db.add(
                    SupplementLog(
                        supplement_schedule_seq=schedule.supplement_schedule_seq,
                        log_date=log_date,
                        status=status,
                        actual_time=schedule.scheduled_time if status == CheckStatus.DONE else None,
                    )
                )

        for medication_sample in MEDICATION_SAMPLES:
            medication_item = MedicationItem(
                user_seq=demo_user.user_seq,
                name=medication_sample["name"],
                product_name=medication_sample["product_name"],
                company_name=medication_sample["company_name"],
                timing=medication_sample["timing"],
                status=EatStatus.ING,
                is_prescription=medication_sample["is_prescription"],
            )
            db.add(medication_item)
            await db.flush()

            medication_schedule = MedicationSchedule(
                medication_item_seq=medication_item.medication_item_seq,
                scheduled_time=medication_sample["scheduled_time"],
            )
            db.add(medication_schedule)
            await db.flush()

            for day_offset in range(SAMPLE_DAYS):
                log_date = today - timedelta(days=day_offset)
                status = random.choices(
                    [CheckStatus.DONE, CheckStatus.SKIPPED, CheckStatus.UNCHECKED],
                    weights=[85, 10, 5],
                )[0]
                db.add(
                    MedicationLog(
                        medication_schedule_seq=medication_schedule.medication_schedule_seq,
                        log_date=log_date,
                        status=status,
                        actual_time=medication_schedule.scheduled_time if status == CheckStatus.DONE else None,
                    )
                )

        for day_offset in range(SAMPLE_DAYS):
            measured_at = datetime.combine(today - timedelta(days=day_offset), time(8, 0))

            db.add(
                BloodPressureRecord(
                    user_seq=demo_user.user_seq,
                    measured_at=measured_at,
                    systolic=random.randint(112, 138),
                    diastolic=random.randint(70, 90),
                    pulse=random.randint(58, 82),
                )
            )

            check_timing = CheckTiming.EMPTY if day_offset % 2 == 0 else CheckTiming.AFTER_2H
            glucose_value = random.randint(85, 105) if check_timing == CheckTiming.EMPTY else random.randint(110, 150)
            db.add(
                BloodSugarRecord(
                    user_seq=demo_user.user_seq,
                    measured_at=measured_at,
                    check_timing=check_timing,
                    glucose_value=glucose_value,
                )
            )

        await db.commit()
        print(f"데모 계정 시딩 완료 - user_id: {DEMO_USER_ID}, password: {DEMO_PASSWORD}")


if __name__ == "__main__":
    asyncio.run(seed_demo())
