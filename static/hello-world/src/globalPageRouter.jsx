import { useState, useEffect } from 'react';
import { view } from '@forge/bridge';
import 'rsuite/dist/rsuite.min.css';
import Requirements from './requirements';
import { Router, Route, Routes } from "react-router";
import Loader from './loader';
import Dashboard from './dashboard';
import ValidationChecklist from './validationChecklist';


const GlobalPageRouter = () => {

    const [history, setHistory] = useState(null);
    const [historyState, setHistoryState] = useState(null);


    useEffect(() => {
        view.createHistory().then((newHistory) => {
            setHistory(newHistory);
        });
    }, []);

    useEffect(() => {
        if (!historyState && history) {
          setHistoryState({
            action: history.action,
            location: history.location,
          });
        }
      }, [history, historyState]);

    useEffect(() => {
        if (history) {
            history.listen((location, action) => {
                setHistoryState({
                    action,
                    location,
                });
            });
        }
    }, [history]);

    return (
        <>
         {history && historyState ? (
        <Router
          navigator={history}
          navigationType={historyState.action}
          location={historyState.location}
        >
          <Routes>
            <Route path="/requirements" element={<Requirements />}></Route>
            <Route path="/dashboard" element={<Dashboard/>}></Route>
            <Route path="/validationChecklist" element={<ValidationChecklist/>}></Route>
            <Route path="/" element={<div>Home</div>}></Route>
          </Routes>
        </Router>
      ) : (
        <Loader />
      )}
        </>

    );
};

export default GlobalPageRouter;