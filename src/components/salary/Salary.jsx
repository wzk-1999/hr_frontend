import React, { useEffect, useState, useRef } from 'react';
import { Table, message, Button, Modal, Input } from 'antd';
import FooterComponent from '../public/components/FooterComponent';
import HeaderComponent from '../public/components/HeaderComponent';
import {jwtDecode} from 'jwt-decode'; // Correctly imported
import axios from 'axios';
import { EyeOutlined } from '@ant-design/icons'; // Import the Eye icon

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Salary = () => {
    const [salaryData, setSalaryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        position: 'bottom',
        showSizeChanger: true,
        pageSizeOptions: ['5', '10', '20', '50'],
        showTotal: (total) => `Total ${total} Records`,
    });
    const [visibleSalaries, setVisibleSalaries] = useState({});
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedSalary, setSelectedSalary] = useState(null);
    const [password, setPassword] = useState('');
    const [salaryType, setSalaryType] = useState(''); // State to keep track of selected salary type for decryption
    const token = localStorage.getItem("jwtToken");
    const username = token ? jwtDecode(token).username : null;
    // Ref to track if the effect has run once
 // useRef to store the last combination of username, pagination.current, and pagination.pageSize
 const prevCombination = useRef({ username: null, current: null, pageSize: null });

    const fetchSalaryRecords = async (page = 1, pageSize = 10) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/Salary/Show`, {
                page: page,
                pageSize: pageSize
            }, {
                headers: {
                    Authorization: token // Include JWT token from localStorage
                }
            });
            setSalaryData(response.data.records);
            setPagination(prevPagination => ({
                ...prevPagination,
                total: response.data.totalRecords, // Update total records
                showTotal: (total) => `Total ${total} Records`, // Show total records and current page info
            }))
        }
         catch (error) {
            if (error.response && error.response.status === 401) {
                message.error('Login time out, redirecting to login page...');
                setTimeout(() => {
                    window.location.href = '/'; // Redirect to login page after 2 seconds
                }, 2000);
            } else {
                message.error('Failed to fetch salary records.');
                console.error(error);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
           // Construct the current combination of dependencies
           const currentCombination = {
            username: username,
            current: pagination.current,
            pageSize: pagination.pageSize
        };

         // Check if the combination has changed from the last execution
         if (
            currentCombination.username !== prevCombination.current.username ||
            currentCombination.current !== prevCombination.current.current ||
            currentCombination.pageSize !== prevCombination.current.pageSize
        ){if (!username) {
            message.error('Username not found in local storage.');
            setLoading(false);
            return;
        }

      
            fetchSalaryRecords(pagination.current, pagination.pageSize);
            // console.log('fetchSalaryRecords triggered');
            // console.log('username:', username);
            // console.log('current page:', pagination.current);
            // console.log('page size:', pagination.pageSize);
        
             // Update the ref to the current combination after fetching data
             prevCombination.current = currentCombination;
    }
}, [username, pagination.current, pagination.pageSize]);

    const handleToggleVisibility = (record, type) => {
        setSelectedSalary(record);
        setSalaryType(type); // Set the selected salary type (BaseSalary, PerformanceBonus, etc.)
        setIsModalVisible(true);
    };

    const handleModalOk = async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/Salary/View`, {
                Year: selectedSalary.year,
                Month: selectedSalary.month,
                salaryType: salaryType, // Use the selected salary type
                password: password
            }, {
                headers: {
                    Authorization: token
                }
            });

            setVisibleSalaries(prevState => ({
                ...prevState,
                [`${selectedSalary.year}-${selectedSalary.month}-${salaryType}`]: response.data // Set the decrypted salary based on year, month, and salary type
            }));

            message.success('Salary details revealed.');
            setIsModalVisible(false);
            setPassword('');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                const errorMessage = error.response.data;
            if (errorMessage === 'Invalid JWT token') {
                message.error('Session expired or invalid. Please log in again.');
                // Optionally redirect to the login page
                setTimeout(() => {
                    window.location.href = '/'; // Redirect to login page
                }, 2000);
            } else if (errorMessage === 'Invalid password') {
                message.error('Incorrect password. Please try again.');
            } else {
                message.error('Unauthorized access.');
            }
        } else {
                message.error('Failed to retrieve salary details.');
                console.error(error);
            }
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        setPassword('');
    };

    const handleTableChange = (pagination) => {
        setPagination({
            ...pagination,
            current: pagination.current,
            pageSize: pagination.pageSize,
            // pageSize: 8,
        });
    };

    const columns = [
        {
            title: 'Year',
            dataIndex: 'year',
            key: 'year'
        },
        {
            title: 'Month',
            dataIndex: 'month',
            key: 'month'
        },
        {
            title: 'Base Salary',
            dataIndex: 'baseSalary',
            key: 'baseSalary',
            render: (text, record) => (
                <div>
                    {visibleSalaries[`${record.year}-${record.month}-Base_salary`] ? `¥${visibleSalaries[`${record.year}-${record.month}-Base_salary`]}` : '¥****'}
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => handleToggleVisibility(record, 'Base_salary')}
                        size="small"
                        style={{ marginLeft: 8 }}
                    />
                </div>
            ),
        },
        {
            title: 'Performance Bonus',
            dataIndex: 'performanceBonus',
            key: 'performanceBonus',
            render: (text, record) => (
                <div>
                    {visibleSalaries[`${record.year}-${record.month}-Performance_bonus`] ? `¥${visibleSalaries[`${record.year}-${record.month}-Performance_bonus`]}` : '¥****'}
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => handleToggleVisibility(record, 'Performance_bonus')}
                        size="small"
                        style={{ marginLeft: 8 }}
                    />
                </div>
            ),
        },
        {
            title: 'Apprentice Bonus',
            dataIndex: 'apprenticeBonus',
            key: 'apprenticeBonus',
            render: (text, record) => (
                <div>
                    {visibleSalaries[`${record.year}-${record.month}-Apprentice_bonus`] ? `¥${visibleSalaries[`${record.year}-${record.month}-Apprentice_bonus`]}` : '¥****'}
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => handleToggleVisibility(record, 'Apprentice_bonus')}
                        size="small"
                        style={{ marginLeft: 8 }}
                    />
                </div>
            ),
        },
        {
            title: 'Evergreen Bonus',
            dataIndex: 'evergreenBonus',
            key: 'evergreenBonus',
            render: (text, record) => (
                <div>
                    {visibleSalaries[`${record.year}-${record.month}-Evergreen_bonus`] ? `¥${visibleSalaries[`${record.year}-${record.month}-Evergreen_bonus`]}` : '¥****'}
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => handleToggleVisibility(record, 'Evergreen_bonus')}
                        size="small"
                        style={{ marginLeft: 8 }}
                    />
                </div>
            ),
        },
    ];

    return (
        <>
            <HeaderComponent />
            <div>
                <h1>Basic Law Salary Records</h1>
                <Table
                    columns={columns}
                    dataSource={salaryData}
                    rowKey={(record) => `${record.year}-${record.month}`}
                    loading={loading}
                    pagination={pagination}
                    onChange={handleTableChange}
                />
            </div>
            <Modal
                title="View Salary Details"
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
            >
                <Input.Password
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </Modal>
            <FooterComponent />
        </>
    );
};

export default Salary;
