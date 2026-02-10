import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Message from "../Message";
import Loader from "../Loader";
import { getUserDetails,  userProfileUpdate } from "../../actions/userAction";
import { Button, Col, Form, Row,  } from "react-bootstrap";
const ProfileScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userDetails = useSelector((state) => state.userDetails);
  const { loading, error, user } = userDetails;
  const userLogin = useSelector((state)=>state.userLogin);
  const {userInfo} = userLogin;
  const userUpdateProfile = useSelector((state)=>state.userUpdateProfile);
  const {success} = userUpdateProfile;
  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
    }else{
        if(!user.name){
            dispatch(getUserDetails('profile'))
        }else{
            console.log(user.name);
            
            setName(user.name);
            setEmail(user.email)
        }
    }
  },[navigate, userInfo,dispatch,user]);
  const submitHandler = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!name || !name.trim()) newErrors.name = "Name is required";
    if (!email || !email.trim()) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (!confirmPassword) newErrors.confirmPassword = "Confirm password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMessage(null);
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      setErrors({ password: "", confirmPassword: "" });
    }else{
      dispatch(userProfileUpdate({id:user._id,name,email,password}))
    }

    // clear errors and submit (normalize email)
    setErrors({});
    setMessage(null);
    
  };

  return (
  <>
  <Row>
    <Col md={3}>
    <h2>User Profile</h2>
     {message && <Message variant="danger">{message}</Message>}
      {error && <Message variant="danger">{error}</Message>}
      {success && <Message variant="success">Profile Updated</Message>}

      {loading && <Loader />}
    <Form onSubmit={submitHandler}>
            <Form.Group controlId="name" className="mb-3">
              <Form.Label style={{ fontWeight: 600 }}>Name</Form.Label>
              <Form.Control
                type="name"
                placeholder="Enter name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                className="py-2"
                isInvalid={!!errors.name}
              />
              {errors.name && (
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              )}
              <Form.Label style={{ fontWeight: 600 }}>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                }}
                className="py-2"
                isInvalid={!!errors.email}
              />
              {errors.email && (
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group controlId="password" className="mb-3">
              <Form.Label style={{ fontWeight: 600 }}>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                }}
                className="py-2"
                isInvalid={!!errors.password}
              />
              {errors.password && (
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
              )}
             
            </Form.Group>
            <Form.Group controlId="confirmPassword" className="mb-3">
              <Form.Label style={{ fontWeight: 600 }}>
                Confirm Password
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword)
                    setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                }}
                className="py-2"
                isInvalid={!!errors.confirmPassword}
              />
              {errors.confirmPassword && (
                <Form.Control.Feedback type="invalid">
                  {errors.confirmPassword}
                </Form.Control.Feedback>
              )}
            </Form.Group>
            <Button type="submit" variant="primary" className="w-100 mt-2" disabled={loading}>
              Update
            </Button>
          </Form>
    </Col>
    <Col md={9}>
    <h2>My Orders</h2>
    </Col>
  </Row>
  </>
  );
}

export default ProfileScreen
