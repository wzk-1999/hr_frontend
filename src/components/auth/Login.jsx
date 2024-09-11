import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message, Input, Button, Form } from 'antd'; // Importing Ant Design components

const Login = () => {
  const navigate = useNavigate(); // Hook for navigation
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
      // Use the Vite environment variable
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    // console.log(API_BASE_URL)
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/BO-hr-system/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.text(); // If the response body is a string (token), use text()
        localStorage.setItem('jwtToken', data); // Save token to local storage
        message.success('登录成功'); // Display success message
        navigate('/user/home'); // Redirect to /home
      } else {
        const errorMessage = await response.text();
        message.error(`登录失败: ${errorMessage}`); // Display error message
      }
    } catch (error) {
      message.error(`登录请求出错: ${error.message}`); // Display error message if request fails
    }
  };

  return (
    <div style={{ maxWidth: 300, margin: '0 auto', padding: '50px' }}> {/* Basic styling */}
      <Form onSubmitCapture={handleSubmit}> {/* Ant Design Form */}
        <Form.Item label="用户名">
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="请输入用户名"
          />
        </Form.Item>
        <Form.Item label="密码">
          <Input.Password
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
          />
        </Form.Item>
        <Button type="primary" htmlType="submit" block> {/* Ant Design Button */}
          登录
        </Button>
      </Form>
    </div>
  );
};

export default Login;
