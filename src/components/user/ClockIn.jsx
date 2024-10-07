import React, { useState, useEffect,useRef } from 'react';
import { Button, Typography, Alert,message } from 'antd';
import {jwtDecode} from 'jwt-decode'; 
import getAddressFromCoordinates from '../public/functions/getAddressFromCoordinates'; // Adjust the path as needed
import FooterComponent from '../public/components/FooterComponent';
import HeaderComponent from '../public/components/HeaderComponent';

const { Title } = Typography;

function ClockIn() {
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState(null);
  const [error, setError] = useState(null);
  const [buttonText, setButtonText] = useState('');
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState(null);
  const [greeting, setGreeting] = useState('早上好'); // Default to morning greeting
  const [morningClockInTime, setMorningClockInTime] = useState(null); // Store morning clock-in time
  const [photoTaken, setPhotoTaken] = useState(false);
  const [photoData, setPhotoData] = useState(null); // Store captured photo data
  const [cameraVisible, setCameraVisible] = useState(false); // Control camera visibility
  const [captureButtonText, setCaptureButtonText] = useState("Capture Photo"); // Button text for capturing photo



  const videoRef = useRef(null); // To show video preview
  const canvasRef = useRef(null); // To capture the photo

  const token = localStorage.getItem("jwtToken");
  const username = token ? jwtDecode(token).username : null;


  const determineButtonText = async () => {
    // console.log("execute")
    const morningData = await fetchClockInData(1);
    
    const afternoonData = await fetchClockInData(0);

    if (morningData && !afternoonData) {
      setButtonText("打下班卡");
      setMorningClockInTime(morningData.clockInTime);
    } else if (morningData && afternoonData) {
      setButtonText("已下班");
    } else {
      setButtonText("立即打卡");
    }
  };

  useEffect(() => {
    // Determine if it's morning or afternoon based on Beijing time
    const currentHour = new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai', hour: '2-digit', hour12: false });
    const isMorning = currentHour < 12;
    setGreeting(isMorning ? '早上好' : '下午好');

    // Get the geo-location of the device
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });

          // Perform reverse geocoding to get address
          try {
            const address = await getAddressFromCoordinates(latitude, longitude);
            setLocationName(address);
          } catch (err) {
            setError("Error retrieving location name");
          }
        },
        (error) => {
          setError("Unable to retrieve your location"+error);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }

    determineButtonText(); 
    // startCamera(); // Start camera on component mount

    return () => {
      stopCamera(); // Stop camera on component unmount
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    } catch (error) {
      setError("Unable to access the camera. Please allow camera access.");
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    // Set canvas size to match video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get the image data from the canvas
    const imageData = canvas.toDataURL('image/png');
    setPhotoData(imageData); // Store the captured photo data
    setPhotoTaken(true);

     // Change the button text to "Recapture"
  setCaptureButtonText("Recapture");

     // Stop the camera stream after the photo is taken
  stopCamera();
  };


  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage(null);
      }, 2000);

      return () => clearTimeout(timer); // Cleanup the timer on unmount
    }
  }, [alertMessage]);

    // Use the Vite environment variable
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchClockInData = async (_isMorning) => {
      if (!username) return null;
  
      const datePart = new Date().toLocaleDateString('en-US');
      const key = `${username}:${datePart}:${_isMorning}`;
  
      try {
        const response = await fetch(`${API_BASE_URL}/ClockIn/hash?key=${key}`);
        if (response.ok) {
          const data = await response.json();
      
          // Check if the data is empty, treat it as no data found
          if (Object.keys(data).length === 0) {
            return null; // No data found
          }
          
          return data; // Return the fetched data if not empty
        } else {
          return null; // Handle as no data found on non-OK status
        }
      } catch (err) {
        console.error(`Error fetching clock-in time for isMorning=${_isMorning}:`, err);
        return null;
      }
    };


  const handleRecapture = () => {
    setPhotoTaken(false); // Allow the user to capture a new photo
    setCaptureButtonText("Capture Photo"); // Reset the button text
    startCamera(); // Restart the camera for recapture
  };

  const handleClockIn = async () => {

    if (!photoTaken) {
      message.warning("Please take a photo before clocking in.");
      setCameraVisible(true); // Show the camera when the clock-in button is clicked
    startCamera(); // Start the camera
      return;
    }
    // Get current time in Beijing time for clock-in
    const clockInTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai', hour12: false });
    const deviceInfo = navigator.userAgent; // Get the device information
    // console.log("handleClockIn")
    if (buttonText === "已下班"){
      // Show alert and prevent punch out
      message.warning(`今日打卡已结束，早点休息哦`);
      return;
    }
    // If punching out, check if 8 hours have passed since morning clock-in
    if (buttonText === "打下班卡") {
      // console.log("打下班卡")
      const morningData = await fetchClockInData(1);
      if(morningData){setMorningClockInTime(morningData.clockInTime);}
      // console.log(morningData)
      if (morningClockInTime) {
        const morningTime = new Date(morningClockInTime);
        const currentTime = new Date(clockInTime);
        const hoursDifference = (currentTime - morningTime) / (1000 * 60 * 60); // Convert milliseconds to hours
        // console.log(morningTime)
        if (hoursDifference < 8) {
          // Show alert and prevent punch out
          message.warning(`You need to punch out at least 8 hours after your morning clock-in. Earliest punch-out time is ${new Date(morningTime.getTime() + 8 * 60 * 60 * 1000).toLocaleTimeString('en-US', { hour12: false })}.`);
          return;
        }else{
          setButtonText("已下班");
          // didn't return, will execute the logic behind
        }
      } else {
        message.error("Morning clock-in time not found. Please clock in first.");
        return;
      }
    }

    if (!username) {
      setAlertMessage("Unable to retrieve username");
      setAlertType("error");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/ClockIn/normalClockIn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          clockInTime,
          location,
          locationName,
          isMorning: buttonText === "打下班卡" ? 0 : 1, // Set isMorning based on button text
          deviceInfo, // Include device information
          photo: photoData, // Include the photo in the request
        }),
      });

      if (response.ok) {
        setAlertMessage("Clock-in successful!");
        setAlertType("success");
        if (buttonText === "立即打卡") {
          setButtonText("打下班卡");
        } 
        setCameraVisible(false);
      } else {
        const errorText = await response.text();
        setAlertMessage("Clock-in failed: " + errorText);
        setAlertType("error");
      }
    } catch (error) {
      setAlertMessage("Error during clock-in: " + error.message);
      setAlertType("error");
    }
  };

  return (
    <>
      <HeaderComponent />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', paddingTop: '50px' }}>
        {alertMessage && (
          <Alert 
            message={alertMessage} 
            type={alertType} 
            showIcon 
            style={{ position: 'fixed', top: '20px', zIndex: 1000, width: '90%' }} 
            closable 
            onClose={() => setAlertMessage(null)} 
          />
        )}
        <Title level={2}>{greeting}，{username}</Title>

           {/* Show camera and capture button when cameraVisible is true */}
           {cameraVisible && (
          <>
            <video ref={videoRef} style={{ width: '300px', height: '300px', borderRadius: '50%', /* Makes the video circular */
                objectFit: 'cover',  /* Ensures the video fits inside the circle */ border: '1px solid #ccc', display: photoTaken ? 'none' : 'block' }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            {photoTaken && <img src={photoData} alt="Captured" style={{ width: '300px', height: '300px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #ccc' }} />}
            <Button onClick={photoTaken ? handleRecapture : capturePhoto} style={{ marginTop: '20px',marginBottom: '20px' }}>
              {captureButtonText}
            </Button>
          </>
        )}
        <Button
          type="primary"
          size="large"
          style={{
            borderRadius: '50%',
            width: '150px',
            height: '150px',
            fontSize: '16px',
            textAlign: 'center',
          }}
          onClick={handleClockIn}
          // disabled={!photoTaken} // Disable clock-in button until photo is taken
        >
          {buttonText}
        </Button>
        {locationName && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p>Location: {locationName}</p>
          </div>
        )}
        {error && (
          <Alert message={error} type="error" style={{ marginTop: '20px', textAlign: 'center' }} />
        )}
      </div>
      <FooterComponent />
    </>
  );
}

export default ClockIn;
