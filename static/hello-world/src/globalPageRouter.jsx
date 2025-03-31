import { useState, useEffect } from 'react';
import { view } from '@forge/bridge';
import { Message } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import Requirements from './requirements';
import { Router, Route, Routes } from "react-router";
import Loader from './loader';
import Dashboard from './dashboard';
import ValidationChecklist from './validationChecklist';
import VerificationChecklist from './verificationChecklist';
import RequirementViewEdit from './requirement';
import Types from './types';
import Stages from './stages';
import Status from './status';
import BaselineVersions from './baselineVersions';


const GlobalPageRouter = () => {

  const [history, setHistory] = useState(null);
  const [historyState, setHistoryState] = useState(null);
  const [message, setMessage] = useState();
  const loadingState = useState(false);

  const [loading, setLoading] = loadingState;

  const notifier = (type, message) => {
    setMessage({ type, message })
    setTimeout(() => {
      setMessage(undefined)
    }, 6000)
  }


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
      {message && <div>
        <Message showIcon type={message.type}>
          {message.message}
        </Message>
      </div>}
      {history && historyState && !loading ? (
       <Router
          navigator={history}
          navigationType={historyState.action}
          location={historyState.location}
        >
          <Routes>
            <Route exact={true} path="/" element={<div>ReqChase</div>}></Route>
            <Route path="/requirement/:id"  element={<RequirementViewEdit notifier={notifier} loadingState={loadingState} />}></Route>
            <Route path="/requirements" element={<Requirements notifier={notifier} loadingState={loadingState} />}></Route>
            <Route path="/dashboard" element={<Dashboard notifier={notifier} loadingState={loadingState} />}></Route>
            <Route path="/validationChecklist" element={<ValidationChecklist notifier={notifier} loadingState={loadingState} />}></Route>
            <Route path="/verificationChecklist" element={<VerificationChecklist notifier={notifier} loadingState={loadingState} />}></Route>
            <Route path="/types" element={<Types notifier={notifier} loadingState={loadingState} />}></Route>
            <Route path="/stages" element={<Stages notifier={notifier} loadingState={loadingState} />}></Route>
            <Route path="/status" element={<Status notifier={notifier} loadingState={loadingState} />}></Route>
            <Route path="/versions" element={<BaselineVersions notifier={notifier} loadingState={loadingState} />}></Route>
          </Routes>
        </Router>
        
       
      ) : (
        <Loader />
      )}
    </>

  );
};

export default GlobalPageRouter;