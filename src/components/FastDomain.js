import React, {useState, useEffect} from "react"
import {Button} from "react-bootstrap";
import {useContractKit} from "@celo-tools/use-contractkit";
import {getDomain, getConnectedAddressDomain, mintToken, getAllregisteredDomains, approve, isDomainRegistered, reassignDomain} from "../utils/fastDomain";
import Loader from "./ui/Loader";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import{ NotificationSuccess, NotificationError } from "./ui/Notifications"
import { BiCalendarEdit, BiBookReader, BiLandscape, BiDollarCircle, BiSort} from "react-icons/bi";
import "../App.css"
let aboutImage = require("../images/img/about-img.jpg");
let whyUs1 = require("../images/img/why-us-1.jpg"); 
let whyUs2 = require("../images/img/why-us-2.jpg");
let whyUs3 = require("../images/img/why-us-3.jpg");


const FastDomain = ({fastDomainContract, tokenContract}) => {
    const [loading, setLoading] = useState(false);
    const [domainName, setdomainName] = useState("")
    const [userAddress, setUseraddress] = useState("");
    const [newDomainName, setNewdomain] = useState("")
    const [allDomain, setallDomain] = useState([]); //alldomain fetch
    const {performActions, address} = useContractKit();

    useEffect(() => {
        try {
            if (fastDomainContract) {
                fetchDomain()
                fetchAllDomain()
            }
        } catch (error) {
            console.log({error});
        }
    }, [fastDomainContract]);


    const handleSubmit = (event) => {
        event.preventDefault();
        registerfastDomain()
      };

    const getDomainSubmit = (event) => {
      event.preventDefault();
      getdomain()
    };

    const reAssignSubmit = (event) => {
      event.preventDefault();
      reAssignDomain()
    };

    
    
      const updateInput =() => {
        setdomainName("");

      }

      const registerFastDomain = async (fastDomainContract, performActions, _domainName) => {
        try {
            await performActions(async (kit) => {
                const {defaultAccount} = kit;
                await fastDomainContract.methods.registerFastDomain(_domainName).send({from: defaultAccount});
                toast(<NotificationSuccess text={<span>{_domainName} registered successfully &#127881;</span> } />); 
            });
        } catch (e) {
          toast(<NotificationError text={<span> Insufficient Token <Button className="m-2" variant="dark" size="lg" onClick={mintFastToken}>
          Mint Token
          </Button></span> 
 } />);
            console.log({e});
        }
    };

    const registerfastDomain = async () => {
        try {
            setLoading(true); 
          const value = await isDomainRegistered(fastDomainContract , domainName)
          const value1 = await getdomain()
             if(value === false && value1 === ""){
              await approve(tokenContract, performActions);
              await registerFastDomain(fastDomainContract, performActions, domainName) 
            }

        } catch (e) {
            toast(<NotificationError text={ 
            <Button className="m-2" variant="dark" size="lg" onClick={mintFastToken}>
            Mint Token
            </Button> } />);
            console.log("error", e)
        } finally {
            setLoading(false)
            updateInput()
            fetchAllDomain()
        }
    };

    const fetchDomain = async () => {
        try {
            setLoading(true)
          await getConnectedAddressDomain(fastDomainContract, performActions)
        } catch (e) {
            console.log({e})
        } finally {
            setLoading(false)
        }
    };

    const fetchAllDomain = async () => {
        try {
            setLoading(true)
            const value = await getAllregisteredDomains(fastDomainContract)
            setallDomain(value)
        } catch (e) {
            console.log({e})
        } finally {
            setLoading(false)
        }
    };

    const getdomain = async () => {
      let reqAddress;
      if(userAddress === ""){
        reqAddress = address;
      }else {
        reqAddress = userAddress
      }
      try {
          setLoading(true)
          const value = await getDomain(fastDomainContract, reqAddress)
          if(value === ""){
            toast(<NotificationSuccess text={<span> {reqAddress} is not registered &#127881;</span> } />);
          }else{
            toast(<NotificationSuccess text={<span> {reqAddress} belongs to {value} &#127881;</span> } />);
          } 
          return value;
      } catch (e) {
          console.log({e})
      } finally {
          setLoading(false)
          setUseraddress("")
      }
  };

  const reAssignDomain = async () => {
    try {
        setLoading(true)
        const value = await isDomainRegistered(fastDomainContract , newDomainName)
        if(value === false){
          await approve(tokenContract, performActions);
          await reassignDomain(fastDomainContract,performActions, newDomainName)
        }
    } catch (e) {
        console.log({e})
    } finally {
        setLoading(false)
        setNewdomain("")
        fetchAllDomain()
    }
};


    const mintFastToken = async () => {
        try {
            setLoading(true)
            await mintToken(fastDomainContract, performActions)
            toast(<NotificationSuccess text="Token Minted Succesfully...." />); 

        } catch (e) {
          toast(<NotificationError text="OOps, Already Minted." />);
            console.log({e})
        } finally {
            setLoading(false)
        }
    };

    

    return (
      <div>
        {!loading ? (
          <div>
            {/* ======= Hero Section ======= */}
            <section id="hero">
                              
                  <svg viewBox="0 0 100 100" width="70" height="70">
                  <defs>
                    <path id="circle"
                      d="
                        M 50, 50
                        m -37, 0
                        a 37,37 0 1,1 74,0
                        a 37,37 0 1,1 -74,0"/>
                  </defs>
                  <text font-size="17">
                    <textPath xlinkHref="#circle">
                      {allDomain.length} Domain Name Registered 
                    </textPath>
                  </text>
                </svg>

              <div className="hero-container">
                <h1>Welcome to FastDomain</h1>
                <h2>Register your domain</h2>

                <form onSubmit={handleSubmit} className="email-form">
                  <div className="row no-gutters">
                    <div className="col-md-6 form-group pr-md-1">
                      <input
                        type="text"
                        id="domainName"
                        name="name"
                        className="form-control"
                        value={domainName}
                        placeholder="Domain Name"
                        required
                        onChange={(event) => setdomainName(event.target.value)}
                      />
                    </div>
                    <div></div>
                  </div>
                  <div className="text-center">
                    <button type="submit">Submit!</button>
                  </div>
                </form>
              </div>
            </section>
            {/* #hero */}
            <main id="main">
              {/* ======= About Section ======= */}
              <section id="about" className="about">
                <div className="container">
                  <div className="row">
                    <div className="col-lg-6">
                      <img
                        src={aboutImage.default}
                        className="img-fluid"
                        alt="about"
                      />
                    </div>
                    <div className="col-lg-6 pt-4 pt-lg-0">
                      <div className="section-title">
                        <h2>Most Recent Domain</h2>
                      </div>
                      <p className="fst-italic display-6">
                        {allDomain.slice(-4).map((element, index) => (
                          <p key={index}>{element}</p>
                        ))}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
              {/* End About Section */}
              {/* ======= Why Us Section ======= */}

              <section id="why-us" className="why-us section-bg">
                <div className="container">
                  <div className="row">
                    <div className="col-lg-4 col-md-6 d-flex align-items-stretch">
                      <div className="card">
                        <img
                          src={whyUs1.default}
                          className="card-img-top"
                          alt="..."
                        />
                        <div className="card-icon">
                          <i>
                            <BiBookReader />{" "}
                          </i>
                        </div>
                        <div className="card-body">
                          <h5 className="card-title">
                            <a href>Our Mission</a>
                          </h5>
                          <p className="card-text">
                            {" "}
                            Our mission is to simplify blockchain transactions
                            by providing a user-friendly Naming Service
                            (FastDomain) app for CELO blockchain. We aim to
                            enhance accessibility and ease of use for users,
                            enabling them to interact with the decentralized web
                            seamlessly.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-6 d-flex align-items-stretch">
                      <div className="card">
                        <img
                          src={whyUs2.default}
                          className="card-img-top"
                          alt="..."
                        />
                        <div className="card-icon">
                          <i>
                            {" "}
                            <BiCalendarEdit />{" "}
                          </i>
                        </div>
                        <div className="card-body">
                          <h5 className="card-title">
                            <a href>Our Plan</a>
                          </h5>
                          <p className="card-text">
                            {" "}
                            Our plan involves developing a robust Naming Service
                            app that allows users to register and manage their
                            Celo domain names effortlessly. We will prioritize
                            creating an intuitive and secure interface that
                            integrates seamlessly with existing Celo wallets and
                            dApp browsers. Additionally, we will continuously
                            enhance our app with new features and updates to
                            ensure an exceptional user experience.{" "}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-6 d-flex align-items-stretch">
                      <div className="card">
                        <img
                          src={whyUs3.default}
                          className="card-img-top"
                          alt="..."
                        />
                        <div className="card-icon">
                          <i>
                            {" "}
                            <BiLandscape />{" "}
                          </i>
                        </div>
                        <div className="card-body">
                          <h5 className="card-title">
                            <a href>Our Vision</a>
                          </h5>
                          <p className="card-text">
                            {" "}
                            Our vision is to empower individuals and businesses
                            by enabling them to have personalized and easily
                            recognizable blockchain identities through our
                            FastDomain app. We strive to foster widespread
                            adoption of Naming Service and contribute to the
                            growth of the decentralized web ecosystem.
                            Ultimately, we envision a future where blockchain
                            addresses are replaced by human-readable names,
                            making cryptocurrency transactions more accessible
                            and user-friendly for everyone{" "}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              {/* End Why Us Section */}

              {/* ======= Mint Token Section ======= */}
              <section id="contact" className="contact section-bg">
                <div className="container">
                  <div className="section-title">
                    <h2>Mint Token</h2>
                  </div>
                  <div className="row justify-content-center">
                    <div className="col-lg-3 col-md-5 mb-2 mb-md-0">
                      <div className="info txt">
                        <div className="card-icon">
                          <i>
                            <BiDollarCircle />{" "}
                          </i>
                        </div>
                        <p className="txt">
                          Mint Fast Token for Free and register name{" "}
                        </p>
                      </div>
                    </div>
                    <div className="col-lg-5 col-md-7">
                      <form className="email-form">
                        <div className="form-group">
                          <div className="text-center mt-2">
                            <button type="submit" onClick={mintFastToken}>
                              Mint Token
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </section>
              {/* End mint Token Section */}

              {/* ======= Reassign Domain Section ======= */}
              <section id="contact" className="contact section-bg">
                <div className="container">
                  <div className="section-title">
                    <h2>Reassign Domain</h2>
                  </div>
                  <div className="row justify-content-center">
                    <div className="col-lg-3 col-md-5 mb-2 mb-md-0">
                      <div className="info txt">
                        <div className="card-icon">
                          <i>
                            <BiSort />{" "}
                          </i>
                        </div>
                        <p className="txt">
                          Do you want to reassign your domain name?
                        </p>
                      </div>
                    </div>
                    <div className="col-lg-5 col-md-7">
                      <form onSubmit={reAssignSubmit} className="email-form">
                        <div className="row no-gutters">
                          <div className="form-group mt-1">
                            <input
                              type="text"
                              id="newDomainName"
                              name="name"
                              className="form-control"
                              value={newDomainName}
                              placeholder="New Domain Name"
                              required
                              onChange={(event) =>
                                setNewdomain(event.target.value)
                              }
                            />
                          </div>
                          <div></div>
                        </div>
                        <div className="text-center mt-2">
                          <button type="submit">Submit!</button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </section>
              {/* END reassign Domain Section */}

              {/* ======= Get Domain Section ======= */}
              <section id="contact" className="contact section-bg">
                <div className="container">
                  <div className="section-title">
                    <h2>Get Domain name</h2>
                  </div>
                  <div className="row justify-content-center">
                    <div className="col-lg-3 col-md-5 mb-2 mb-md-0">
                      <div className="info txt">
                        <div className="card-icon">
                          <i>
                            <BiCalendarEdit />{" "}
                          </i>
                        </div>
                        <p className="txt">
                          Get Domain name associated with an address
                        </p>
                      </div>
                    </div>
                    <div className="col-lg-5 col-md-7">
                      <form onSubmit={getDomainSubmit} className="email-form">
                        <div className="row no-gutters">
                          <div className="form-group mt-1">
                            <input
                              type="text"
                              id="userAddress"
                              name="name"
                              className="form-control"
                              value={userAddress}
                              placeholder="User Address"
                              required
                              onChange={(event) =>
                                setUseraddress(event.target.value)
                              }
                            />
                          </div>
                          <div></div>
                        </div>
                        <div className="text-center mt-2">
                          <button type="submit">Submit!</button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </section>
              {/* END Get Domain Section */}
            </main>
            {/* End #main */}

            {/* ======= Footer ======= */}
            <footer id="footer">
              <div className="container">
                <div className="copyright">
                  © Copyright{" "}
                  <strong>
                    <span>FastDomain</span>
                  </strong>
                  . All Rights Reserved
                </div>
                {/* <div className="credits">
              Designed by <a href="https://github.com/Ultra-Tech-code">Ultra-tech</a>
            </div> */}
              </div>
            </footer>
            {/* End #footer */}
          </div>
        ) : (
          <Loader />
        )}
      </div>
    );
};

export default FastDomain;
