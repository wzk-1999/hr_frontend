export default async function getAddressFromCoordinates(latitude, longitude) {
  // Use the Vite environment variable
  const MAP_API_KEY = import.meta.env.VITE_GAODE_MAP_KEY;

  //传入内容规则：经度(longitude)在前，纬度(latitude)在后，经纬度间以“,”分割，经纬度小数点后不要超过 6 位。
  const url = `https://restapi.amap.com/v3/geocode/regeo?location=${longitude},${latitude}&key=${MAP_API_KEY}`;
  //   console.log(url);
  try {
    const response = await fetch(url);
    const data = await response.json();
    // 解析返回的数据以获取地址信息
    // 注意：这里的data结构取决于API的实际返回格式
    // console.log(data.regeocode);
    return data.regeocode.formatted_address;
    //   +
    //   "," +
    //   data.addressComponent.district +
    //   "," +
    //   data.addressComponent.city
  } catch (error) {
    console.error("获取地址失败:", error);
    return "获取地址失败";
  }
}
