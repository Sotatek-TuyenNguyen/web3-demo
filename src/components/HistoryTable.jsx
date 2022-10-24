import { Table } from "antd";
import React from "react";

const HistoryTable = ({ history }) => {   
   const data = history.map(rec => {
      return {
         key: rec.id,
         action: rec.action,
         amount: rec.amount,
         time: rec.time
      }
   });

   console.log('data', data);
   const columns = [
      {
         title: 'Action',
         dataIndex: 'action',
         key: 'action',
      },
      {
         title: 'Amount',
         dataIndex: 'amount',
         key: 'amount',
      },
      {
         title: 'Time',
         dataIndex: 'time',
         key: 'time',
      },
   ];
  return <Table columns={columns} dataSource={data}/>;
};

export default HistoryTable;
