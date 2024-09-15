import React from 'react';
import { Layout, Menu } from 'antd';
import { Link } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Named import

const { Header } = Layout;

const HeaderComponent = () => {
  const token = localStorage.getItem("jwtToken");

  // Decode the token to extract the username
  let username = "";
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      username = decodedToken.username; // Use 'username' from the token
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  const menuItems = [
    {
      key: 'clockin',
      label: <Link to="/user/clockin">打卡</Link>,
    },
    {
      key: 'home',
      label: <Link to="/user/home">首页</Link>,
    },
    {
      key: 'salary',
      label: <Link to="/salary/detail">薪资</Link>,
    }
  ];

  return (
    <Header style={{ 
      position: 'fixed', 
      width: '100%', 
      top: 0, 
      left: 0, 
      zIndex: 1, 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '0 24px', // Add padding to make space on the sides
    }}>
      <Menu mode="horizontal" theme="dark" items={menuItems} />
      <div style={{ 
        color: 'white', 
        position: 'relative',
        right: '10%', // Move the username 10% to the left
        transform: 'translateX(-10%)', // Fine-tune the positioning to the left
      }}>
        {username ? <span>欢迎, {username}</span> : <span>未登录</span>}
      </div>
    </Header>
  );
};

export default HeaderComponent;