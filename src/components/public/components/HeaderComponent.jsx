import React, { useEffect, useState } from 'react';
import { Layout, Menu, message, Dropdown } from 'antd';
import { Link, useNavigate  } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Named import
import axios from 'axios'; // For making backend requests
import removeLocalStorageByPattern from '../functions/removeLocalStorageByPattern';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const { Header } = Layout;

const HeaderComponent = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [dropdownItems, setDropdownItems] = useState([]); // State for dropdown menu items

  const token = localStorage.getItem("jwtToken");
  const [username, setUsername] = useState("");
  const navigate = useNavigate(); // To redirect after logout
  let fetchedUsername=""

  // Decode the token to extract the username
  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUsername(decodedToken.username); // Use 'username' from the token
         fetchedUsername = decodedToken.username; // Use this variable for immediate use
      } catch (error) {
        message.error('Session expired or invalid. Please log in again.');
        navigate("/")
      }
    }

    const storedMenu = localStorage.getItem(fetchedUsername+"menuItems");
    const storedDropdown = localStorage.getItem(fetchedUsername+"dropdownItems");

    if (storedMenu) {
      // If menu is already stored in localStorage, use it
      setMenuItems(createMenuItems(JSON.parse(storedMenu)));
    
      setDropdownItems(JSON.parse(storedDropdown).map(item => ({
        key: item,
        label: item,
      })));
    } else {
      removeLocalStorageByPattern("menuItems$")
      removeLocalStorageByPattern("dropdownItems$")
      // Otherwise, fetch it from the backend
      axios.get(`${API_BASE_URL}/Role/headerManus`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const fetchedMenu = response.data.manus; // Assuming the backend returns an array of strings
        const menuItems = createMenuItems(fetchedMenu);

        const fetchedDropdown=response.data.dropdown;
        const dropdownItems = fetchedDropdown.map(item => ({
          key: item,
          label: item,
        }));
        
        // Store menu in localStorage for future use
        localStorage.setItem(fetchedUsername+"menuItems", JSON.stringify(fetchedMenu));
        localStorage.setItem(fetchedUsername+"dropdownItems", JSON.stringify(fetchedDropdown));
        
        // Set the menu items in the state
        setMenuItems(menuItems);
        setDropdownItems(dropdownItems);

      })
      .catch((error) => {
        message.error('Failed to load menu items from the server.'+error);
      });
    }
  }, [token]);

  // Function to dynamically set menu items based on the parsed menu data
  const createMenuItems = (menuData) => {
    // Split the string by commas, then map each value to create the menu item
    const parsedItems = menuData.flatMap(menuString => 
      menuString.split(',').map(menu => ({
        key: menu.trim(),
        label: <Link to={`/user/${menu.trim()}`}>{getMenuLabel(menu.trim())}</Link>,
      }))
    );

    return parsedItems;
  };

  // Function to map the menu key to a label
  const getMenuLabel = (menuKey) => {
    const menuLabels = {
      clockin: "打卡",
      home: "首页",
      salary: "薪资",
      telentDiscover: "人才发现",
      supplierManagement: "供应商管理",
      telentDB:"人才库",
      permissionManagement:"权限管理"
      // Add more mappings if needed
    };
    return menuLabels[menuKey] || menuKey; // Default to key if label not found
  };


  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem(username+"menuItems");
    localStorage.removeItem(username+"dropdownItems");

    message.success("You have logged out successfully.");
        // Redirect after 1 second
        setTimeout(() => {
          navigate("/");
        }, 1000); // 1000 ms = 1 second
  };

 // Dropdown menu for the user
 const userMenuItems = dropdownItems.length > 0 
 ? [
     ...dropdownItems,
     {
       key: 'logout',
       label: 'Logout',
       onClick: handleLogout
     }
   ]
 : [
     {
       key: 'logout',
       label: 'Logout',
       onClick: handleLogout
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
        {username ? (<><span>欢迎,</span>
          <Dropdown  menu={{ items: userMenuItems }} // Use items prop instead of overlay
            trigger={['hover']}>
            <span style={{ cursor: 'pointer' }}>
              {username}
            </span>
          </Dropdown>
          </>
        ) : (
          <span>未登录</span>
        )}
      </div>
    </Header>
  );
};

export default HeaderComponent;
