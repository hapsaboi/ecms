import React, { useState, useEffect } from "react";
import axios from "axios";
import { user } from "../../data/api";
import { BsArrowBarLeft, BsPlusSquareFill, BsEye } from "react-icons/bs";
import { FaUserCircle } from "react-icons/fa";
import Notifications from "components/Notification/Notification";
import RPagination from "components/Pagination/Pagination";

// reactstrap components
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Table,
  Row,
  Col,
  InputGroup, InputGroupAddon, InputGroupText, Input, Form, FormGroup, Button
} from "reactstrap";

function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [mode, setMode] = useState('all');
  const [current, setCurrent] = useState({ email: "" });
  const [userFound, setUserFound] = useState({});
  const [pagination, setPagination] = useState({ current: 1 });
  const [search, setSearch] = useState('');
  const [notificationStatus, setNotificationStatus] = useState(false)
  const [notificationDetails, setNotificationDetails] = useState({ msg: "", type: "" });

  const [newContract, setNewContract] = useState({});
  async function fetchUser() {
    await axios.get(user.showUserByEmail + "/" + current.email).then((response) => {
      if (response.data.status === true) {
        setUserFound(response.data.data);
        setNotificationDetails({ msg: "User found successfully", type: "success" });
        setNotificationStatus(true);
      }
      else {
        setNotificationDetails({ msg: "Error finding user, Please Referesh The Page", type: "danger" });
        setNotificationStatus(true);
      }
    }).catch((error) => {
      if (error.response) {
        setNotificationDetails({ msg: error.response.data.msg, type: "danger" });
        setNotificationStatus(true);
      } else {
        setNotificationDetails({ msg: "Network Error!", type: "danger" });
        setNotificationStatus(true);
      }

    });
  }

  useEffect(
    () => {
      async function fetchContracts() {
        await axios.get(user.showAllUsers, { params: { ...pagination, search } }).then((response) => {
          if (response.data.status === true) {
            setContracts(response.data.data);
            if (pagination.current === 1) setPagination({ ...pagination, count: response.data.count });
          }
          else {
            setNotificationDetails({ msg: "Error Loading Contracts, Please Referesh The Page", type: "danger" });
            setNotificationStatus(true);
          }
        })
      }
      fetchContracts();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [search]);
  // eslint-disable-next-line react-hooks/exhaustive-deps

  function checkDates(start1, end1) {
    if (!start1 || !end1) {
      return false;
    }
    const date = new Date();

    const start = new Date(start1);
    const end = new Date(end1);
    let result = null;

    if (date > start && date < end) {
      result = true;
    } else {
      result = false;
    }
    return result;
  }
  async function addContract(e) {
    e.preventDefault();
    if (newContract.start_date && newContract.end_date) {
      let newC = userFound;
      newC.Contracts = [newContract, ...newC.Contracts || []]
      await axios.patch(user.updateUser + "/" + userFound._id, newC).then((res) => {
        if (res.data.status) {
          setNotificationDetails({ msg: "Contract Added Successfully.", type: "success" });
        }
        else {
          setNotificationDetails({ msg: "Error Adding Contract.", type: "Danger" });
        }
        setNotificationStatus(true);
      }).catch((error) => {
        if (error.response) {
          setNotificationDetails({ msg: error.response.data.message, type: "danger" });
          setNotificationStatus(true);
        } else {
          setNotificationDetails({ msg: "Network Error!", type: "danger" });
          setNotificationStatus(true);
        }

      });
    } else {
      setNotificationDetails({ msg: "Please input start date and finish date.", type: "danger" });
      setNotificationStatus(true);
    }
  }



  return (
    <>
      {notificationStatus === true ? <Notifications details={notificationDetails} /> : null}
      <div className="content">
        {mode === "all" ?
          <>
            <Row style={{ marginTop: "-30px" }}>
              <Col style={{ padding: "20px" }}><h5>Total: {pagination.count || 0}</h5></Col>
              <Col style={{ paddingTop: "22px" }}>
                <InputGroup style={{ borderColor: "#ccc" }}>
                  <Input placeholder="Search..." onChange={(e) => { setSearch(e.target.value) }} />
                  <InputGroupAddon addonType="append">
                    <InputGroupText>
                      <i className="nc-icon nc-zoom-split" />
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </Col>
              <Col md={3}>
                <button onClick={() => { setMode("add"); setCurrent({}) }} className="btn" style={{ width: "100%", marginTop: "20px", marginBottom: "20px" }}>
                  <BsPlusSquareFill size={20} style={{ marginRight: "10px" }} />   Add Contract
                </button>
              </Col>
            </Row>
            <Card>
              <CardBody>

                <Table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Contracts</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.map((items, key) => {
                      return (
                        <tr key={key}>
                          <td>{items.first_name + " " + items.last_name}</td>
                          <td>{items.email}</td>
                          <td>{items.Contracts.length || 0}</td>
                          <td>{checkDates(items?.Contracts[0]?.start_date, items?.Contracts[0]?.end_date) ? <div style={{ background: "rgb(46, 212, 122)", color: "white", borderRadius: "10px", textAlign: "center" }}>Valid</div> : <div style={{ background: "red", color: "white", borderRadius: "10px", textAlign: 'center' }}>Expired</div>}</td>
                          <td>
                            <button onClick={() => { setMode("view"); setCurrent(items) }} className="btn" style={{ margin: "0px", padding: "5px" }}>
                              <BsEye size={20} /> View
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
            <RPagination pagination={pagination} setPagination={setPagination} />
          </>
          : null
        }

        {mode === "add" ?
          <>
            <Card className="card-user">
              <CardHeader>
                <Row style={{ marginBottom: "-20px" }}>
                  <Col><CardTitle tag="h5">Add Contract</CardTitle></Col>
                  <Col md={3}>
                    <button onClick={() => { setMode("all"); setCurrent({}) }} className="btn" style={{ width: "100%", marginTop: "20px", marginBottom: "20px" }}>
                      <BsArrowBarLeft size={20} />   Back to Contracts
                    </button>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <Form>
                  <Row>
                    <Col className="pr-1" md="6">
                      <FormGroup>
                        <label>Email</label>
                        <Input
                          value={current.email}
                          defaultValue={current.email}
                          placeholder="abdul@gmail.com"
                          type="text"
                          onChange={(e) => setCurrent({ ...current, email: e.target.value })}
                        />
                      </FormGroup>
                    </Col>
                    <Col className="pl-1" md="6">
                      <FormGroup>
                        <label>Fetch Details</label>
                        <br />
                        <Button style={{ marginTop: "-2px" }} onClick={fetchUser}>Find User</Button>
                      </FormGroup>
                    </Col>
                    {Object.keys(userFound).length > 0 ?
                      <Col>
                        <h5>Name: {userFound.first_name + " " + userFound.last_name}</h5>
                        <h5>Role: {userFound.role}</h5>
                      </Col> : null
                    }

                  </Row>


                  <Row>
                    <Col className="pr-1" md="6">
                      <FormGroup>
                        <label>Start Date</label>
                        <Input
                          type="date"
                          onChange={(e) => setNewContract({ ...newContract, start_date: e.target.value })}
                        />
                      </FormGroup>
                    </Col>
                    <Col className="pl-1" md="6">
                      <FormGroup>
                        <label>End Date</label>
                        <Input
                          type="date"
                          onChange={(e) => setNewContract({ ...newContract, end_date: e.target.value })}
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md="12">
                      <FormGroup>
                        <label>Description</label>
                        <Input
                          type="textarea"
                          onChange={(e) => setNewContract({ ...newContract, description: e.target.value })}
                        />
                      </FormGroup>
                    </Col>

                  </Row>

                  <Row>
                    <div className="update ml-auto mr-auto">
                      <Button
                        className="btn-round"
                        color="primary"
                        type="submit"
                        onClick={addContract}
                        disabled={Object.keys(userFound).length > 0 ? false : true}
                      >
                        Add Contract
                      </Button>
                    </div>
                  </Row>
                </Form>
              </CardBody>
            </Card>
          </>
          : null
        }

        {mode === "view" ?
          <>
            <button onClick={() => { setMode("all"); setCurrent({}) }} className="btn" style={{ margin: "0px", padding: "10px", marginBottom: "15px" }}>
              <BsArrowBarLeft size={20} /> Back to Views
            </button>

            <Row>
              <Col md={4}>
                <Card className="card-user">
                  <div style={{ textAlign: "center" }}>
                    <h4 style={{ marginTop: "10px" }}>{current.first_name + " " + current.last_name}</h4>
                    <FaUserCircle size={100} />
                    <h5 style={{ marginTop: "10px" }}>{"Contracts: " + current.Contracts.length || 0}</h5>
                  </div>

                </Card>
              </Col>
              <Col md={8}>
                <Card className="card-user">
                  <div style={{ textAlign: "center" }}>
                    <h4 style={{ marginTop: "10px" }}>All Contracts</h4>
                    <Table>
                      <thead>
                        <tr>
                          <th>Start/End Date</th>
                          <th>Description</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(current.Contracts || []).map((items, key) => {
                          return (
                            <tr key={key}>
                              <td>
                                {items.start_date + " - " + items.end_date}<br />
                              </td>
                              <td> {items.description}</td>
                              <td>
                                {checkDates(items.start_date, items.end_date) ?
                                  <div style={{ background: "rgb(46, 212, 122)", color: "white", borderRadius: "10px", cursor: "not-allowed" }}>Valid</div>
                                  :
                                  <div style={{ background: "crimson", color: "white", borderRadius: "10px", cursor: "not-allowed" }}>Expired</div>


                                }
                              </td>

                            </tr>
                          )
                        })}
                      </tbody>
                    </Table>
                  </div>

                  <CardBody>

                  </CardBody>
                </Card>
              </Col>
            </Row>
          </>
          : null
        }

      </div>
    </>
  );
}

export default Contracts;
