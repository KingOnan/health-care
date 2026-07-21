import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./components/PageTransition";
import Login from "./pages/Login";
import SupplementRecord from "./pages/SupplementRecord";
import SupplementManage from "./pages/SupplementManage";
import SupplementList from "./pages/SupplementList";
import SupplementDetail from "./pages/SupplementDetail";
import SupplementStats from "./pages/SupplementStats";
import MedicationRecord from "./pages/MedicationRecord";
import MedicationManage from "./pages/MedicationManage";
import MedicationList from "./pages/MedicationList";
import MedicationDetail from "./pages/MedicationDetail";
import MedicationStats from "./pages/MedicationStats";
import BloodPressureRecord from "./pages/BloodPressureRecord";
import BloodPressureManage from "./pages/BloodPressureManage";
import BloodPressureStats from "./pages/BloodPressureStats";
import BloodPressureReference from "./pages/BloodPressureReference";
import BloodSugarRecord from "./pages/BloodSugarRecord";
import BloodSugarManage from "./pages/BloodSugarManage";
import BloodSugarStats from "./pages/BloodSugarStats";
import BloodSugarReference from "./pages/BloodSugarReference";
import Chatbot from "./pages/Chatbot";

function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Login />
            </PageTransition>
          }
        />
        <Route
          path="/login"
          element={
            <PageTransition>
              <Login />
            </PageTransition>
          }
        />
        <Route
          path="/supplement"
          element={
            <PageTransition>
              <SupplementRecord />
            </PageTransition>
          }
        />
        <Route
          path="/supplement/manage"
          element={
            <PageTransition>
              <SupplementManage />
            </PageTransition>
          }
        />
        <Route
          path="/supplement/manage/:id"
          element={
            <PageTransition>
              <SupplementManage />
            </PageTransition>
          }
        />
        <Route
          path="/supplement/list"
          element={
            <PageTransition>
              <SupplementList />
            </PageTransition>
          }
        />
        <Route
          path="/supplement/detail/:id"
          element={
            <PageTransition>
              <SupplementDetail />
            </PageTransition>
          }
        />
        <Route
          path="/supplement/stats"
          element={
            <PageTransition>
              <SupplementStats />
            </PageTransition>
          }
        />
        <Route
          path="/medication"
          element={
            <PageTransition>
              <MedicationRecord />
            </PageTransition>
          }
        />
        <Route
          path="/medication/manage"
          element={
            <PageTransition>
              <MedicationManage />
            </PageTransition>
          }
        />
        <Route
          path="/medication/manage/:id"
          element={
            <PageTransition>
              <MedicationManage />
            </PageTransition>
          }
        />
        <Route
          path="/medication/list"
          element={
            <PageTransition>
              <MedicationList />
            </PageTransition>
          }
        />
        <Route
          path="/medication/detail/:id"
          element={
            <PageTransition>
              <MedicationDetail />
            </PageTransition>
          }
        />
        <Route
          path="/medication/stats"
          element={
            <PageTransition>
              <MedicationStats />
            </PageTransition>
          }
        />
        <Route
          path="/blood-pressure"
          element={
            <PageTransition>
              <BloodPressureRecord />
            </PageTransition>
          }
        />
        <Route
          path="/blood-pressure/manage"
          element={
            <PageTransition>
              <BloodPressureManage />
            </PageTransition>
          }
        />
        <Route
          path="/blood-pressure/manage/:id"
          element={
            <PageTransition>
              <BloodPressureManage />
            </PageTransition>
          }
        />
        <Route
          path="/blood-pressure/stats"
          element={
            <PageTransition>
              <BloodPressureStats />
            </PageTransition>
          }
        />
        <Route
          path="/blood-pressure/reference"
          element={
            <PageTransition>
              <BloodPressureReference />
            </PageTransition>
          }
        />
        <Route
          path="/blood-sugar"
          element={
            <PageTransition>
              <BloodSugarRecord />
            </PageTransition>
          }
        />
        <Route
          path="/blood-sugar/manage"
          element={
            <PageTransition>
              <BloodSugarManage />
            </PageTransition>
          }
        />
        <Route
          path="/blood-sugar/manage/:id"
          element={
            <PageTransition>
              <BloodSugarManage />
            </PageTransition>
          }
        />
        <Route
          path="/blood-sugar/stats"
          element={
            <PageTransition>
              <BloodSugarStats />
            </PageTransition>
          }
        />
        <Route
          path="/blood-sugar/reference"
          element={
            <PageTransition>
              <BloodSugarReference />
            </PageTransition>
          }
        />
        <Route
          path="/chatbot/:domain"
          element={
            <PageTransition>
              <Chatbot />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
