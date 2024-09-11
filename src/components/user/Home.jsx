import React from 'react';
import { Layout } from 'antd';

import FooterComponent from '../public/components/FooterComponent';
import HeaderComponent from '../public/components/HeaderComponent';

const { Content } = Layout;

function Home() {

  return (
    <Layout>
      <HeaderComponent/>
      <Layout style={{ marginTop: 64 }}>
        <Content>
          {/* Page content */}
        </Content>
        <FooterComponent/>
      </Layout>
    </Layout>
  );
}

export default Home;
