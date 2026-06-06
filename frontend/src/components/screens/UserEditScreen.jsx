import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Message from '../Message';
import Loader from '../Loader';
import { toast } from 'react-toastify';
import { getUserDetails, userUpdate } from '../../actions/userAction';
import FormContainer from '../FormContainer';
import { Button, Card, Form } from 'react-bootstrap';
import { USER_UPDATE_RESET } from '../../constants/userConstant';
const UserEditScreen = () => {
  const { id } = useParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userDetails = useSelector((state) => state.userDetails);
  const userUpdateState = useSelector((state) => state.userUpdate);
  const {
    loading: loadingUpdateState,
    error: errorUpdateState,
    success: successUpdateState,
  } = userUpdateState;
  const { loading, error, user } = userDetails;
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);
  useEffect(() => {
    if (successUpdateState) {
      dispatch({ type: USER_UPDATE_RESET });
      navigate('/admin/userlist');
    } else {
      if (!user.name || user._id !== id) {
        dispatch(getUserDetails(id));
      } else {
        setName(user.name);
        setEmail(user.email);
        setIsAdmin(user.isAdmin);
      }
    }
  }, [user, id, navigate, successUpdateState]);
  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(userUpdate({ _id: id, name, email, isAdmin }));
  };

  return (
    <>
      <Link to='/' className='btn btn-light my-3'>
        Go Back
      </Link>

      <FormContainer>
        <Card className='p-4 shadow-sm mt-4'>
          <Card.Body>
            <h1 style={{ fontWeight: 600 }} className='mb-3 text-center'>
              Edit User
            </h1>
            {loadingUpdateState && <Loader />}
            {errorUpdateState && (
              <Message variant='danger'>{errorUpdateState}</Message>
            )}
            {loading ? (
              <Loader />
            ) : error ? (
              <Message variant='danger'>{error}</Message>
            ) : (
              <Form onSubmit={submitHandler}>
                <Form.Group controlId='name' className='mb-3'>
                  <Form.Label style={{ fontWeight: 600 }}>Name</Form.Label>
                  <Form.Control
                    type='name'
                    placeholder='Enter name'
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                    className='py-2'
                  />

                  <Form.Label style={{ fontWeight: 600 }}>
                    Email Address
                  </Form.Label>
                  <Form.Control
                    type='email'
                    placeholder='Enter email'
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                  />
                </Form.Group>

                <Form.Group controlId='isadmin' className='mb-3'>
                  <Form.Label style={{ fontWeight: 600 }}>Password</Form.Label>
                  <Form.Check
                    type='checkbox'
                    label='Is Admin'
                    checked={isAdmin}
                    onChange={(e) => {
                      setIsAdmin(e.target.checked);
                    }}
                    className='py-2'
                  />
                </Form.Group>

                <Button
                  type='submit'
                  variant='primary'
                  className='w-100 mt-2'
                  disabled={loading}
                >
                  Update
                </Button>
              </Form>
            )}
          </Card.Body>
        </Card>
      </FormContainer>
    </>
  );
};

export default UserEditScreen;
