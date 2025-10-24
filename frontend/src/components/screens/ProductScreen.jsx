import { Form, Link, useParams } from "react-router-dom";
import { Button, Card, Col, Image, ListGroup, Row } from "react-bootstrap";
//components
import Rating from "../Rating";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { productDetails } from "../../actions/productActions";
import Loader from "../Loader";
import Message from "../Message";
const ProductScreen = () => {
  const productDetail = useSelector((state) => state.productDetails);
  console.log(productDetail);
  const { loading, error, product } = productDetail;
  const [qty, setQty] = useState(0);
  const dispatch = useDispatch();
  const { id } = useParams();

  useEffect(() => {
    dispatch(productDetails(id));
  }, [dispatch]);
  return (
    <>
      <Link className='btn btn-light my-3 ' to='/'>
        Go Back
      </Link>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <Row>
          <Col md={6}>
            <Image src={product.image} alt={product.name} />
          </Col>
          <Col md={3}>
            <ListGroup variant='flush'>
              <ListGroup.Item>
                <h3>{product.name}</h3>
              </ListGroup.Item>
              <ListGroup.Item>
                <Rating
                  value={product.rating}
                  text={`${product.numReviews} reviews`}
                  color='#f8e825'
                />
              </ListGroup.Item>
              <ListGroup.Item>Price: ${product.price}</ListGroup.Item>
              <ListGroup.Item>
                Description: ${product.description}
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md={3}>
            <Card>
              <ListGroup variant='flush'>
                <ListGroup.Item>
                  <Row>
                    <Col>Price:</Col>
                    <Col>
                      <strong>${product.price}</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Status:</Col>
                    <Col>
                      {product.countInStock > 0 ? "In Stock" : "Out Of Stock"}
                    </Col>
                  </Row>
                </ListGroup.Item>
                {product.countInStock > 0 && (
                  <ListGroup.Item>
                    <Row>
                      <Col>Qty</Col>
                      <Col>
                        <Form.Control>
                          <option value='1'>1</option>
                        </Form.Control>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                )}

                <ListGroup.Item>
                  <Button
                    className='btn-block'
                    type='button'
                    disabled={product.countInStock === 0}
                  >
                    Add To Cart
                  </Button>
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};

export default ProductScreen;
