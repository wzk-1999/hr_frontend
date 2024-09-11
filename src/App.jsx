import './App.css';  
import Login from './components/auth/Login'; 
import Home from './components/user/home';
import ClockIn from './components/user/ClockIn';
import React from 'react';  
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
  
function App() {  
  return (  
    <Router>  
      <Routes>  
        <Route path="/" element={<Login />} /> {/* 默认路由指向登录页面 */}  
        <Route path="/user/home" element={<Home />} /> {/* 登录成功后跳转的页面 */}  
        <Route path="/user/clockin" element={<ClockIn />} /> {/* 打卡页面*/}  
        {/* 这里可以添加更多的路由 */}  
      </Routes>  
    </Router>  
  );  
}  
  
export default App;