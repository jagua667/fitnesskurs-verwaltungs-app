import React from 'react';
import Logout from "../Auth/Logout"; 
import Layout from "../../components/Layout";

const DashboardAdmin = () => {
  return (
  <Layout>
      <h2>Admin Dashboard</h2>
      <p>Hier sehen Admins ihre Statistiken und können Kurse verwalten.</p>
   </Layout>
  );
};

export default DashboardAdmin;

