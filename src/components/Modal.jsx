import React, { useState } from "react";
import { Modal, Button, InputNumber } from "antd";

const CustomModal = ({
  isModalVisible,
  handleCancel,
  title,
  handleAction,
  loading,
  modalInfoName,
  modalInfoValue,
}) => {
  const [amount, setAmount] = useState(0);

  const handleTransaction = async () => {
    await handleAction(amount);
    setAmount(0);
  };

  return (
    <Modal
      footer={null}
      cancelButtonProps={false}
      title={title}
      visible={isModalVisible}
      onCancel={handleCancel}
    >
      <div className="custom__modal">
        <InputNumber
          controls={false}
          value={amount}
          size="large"
          style={{ marginBottom: "30px", width: "100%" }}
          onChange={(value) => setAmount(value)}
        />
        <div class="modal__info">
          <strong>{modalInfoName}: </strong>
          <span>{modalInfoValue}</span>
        </div>
        <Button
          type="primary"
          size="large"
          onClick={handleTransaction}
          loading={loading}
        >
          {title}
        </Button>
      </div>
    </Modal>
  );
};

export default CustomModal;
