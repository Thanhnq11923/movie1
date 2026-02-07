import { useNavigate } from 'react-router-dom';

const RedeemSlice = () => {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate('/redeem-point')}>Redeem Point</button>
  );
};

export default RedeemSlice; 