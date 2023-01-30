import logo from './logo.svg';
import abi from './utils/BuyMeACoffee.json';
import {useEffect, useState} from "react";
import { ethers } from "ethers";

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import ListGroup from 'react-bootstrap/ListGroup';
import {Link} from "react-router-dom";
import CreatorDetail from "./components/CreatorDetail";
import "./App.css";

function Home() {
    // Contract Address & ABI
    const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const contractABI = abi.abi;

    const [currentAccount, setCurrentAccount] = useState("");
    const [creators, setCreators] = useState([]);
    const [isSignupModalOpen, setSignupModal] = useState(false);
    const [name, setName] = useState("");
    const [about, setAbout] = useState("");
    const [bannerURL, setBannerURL] = useState("");
    const [creatorDetail, setCreatorDetail] = useState(null);

    const handleOpenSignUp = () => setSignupModal(true);
    const handleCloseSignUp = () => setSignupModal(false);

    const isWalletConnected = async () => {
        try {
            const { ethereum } = window;

            const accounts = await ethereum.request({method: 'eth_accounts'})
            console.log("accounts: ", accounts);

            if (accounts.length > 0) {
                const account = accounts[0];
                console.log("wallet is connected! " + account);
            } else {
                console.log("make sure MetaMask is connected");
            }
        } catch (error) {
            console.log("error: ", error);
        }
    }

    const connectWallet = async () => {
        try {
            const {ethereum} = window;

            if (!ethereum) {
                console.log("please install MetaMask");
            }

            const accounts = await ethereum.request({
                method: 'eth_requestAccounts'
            });

            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log(error);
        }
    }

    const handleSignUp = async () => {
        try {
            const {ethereum} = window;
            if (ethereum) {
                // connect to wallet
                await connectWallet();

                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const buyMeACoffee = new ethers.Contract(
                    contractAddress, contractABI, signer
                );

                console.log("begin signup ...");
                const addCreatorAccountTxn = await buyMeACoffee.addCreatorAccount(
                    name,
                    about,
                    bannerURL
                );
                await addCreatorAccountTxn.wait();

                await getCreators();
            }
        } catch (error) {
            console.log("Error signing up: ", error);
        }
    }

    const handleConnectWallet = async () => {
        await connectWallet();
        await getCreators();
    }

    const getCreators = async () => {
        try {
            const {ethereum} = window;
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const buyMeACoffee = new ethers.Contract(
                    contractAddress,
                    contractABI,
                    signer
                );

                const creators = await buyMeACoffee.getCreators();
                console.log("Creators: ", creators);
                setCreators(creators);
            }
        } catch (error) {
            console.log("Error listing creators: ", error)
        }
    }

    const handleSetCreatorDetail = async(creator) => {
        setCreatorDetail(creator);
    }

    const getCreatorByAddress = async (address) => {
        console.log(`Creators: ${creators}, address: ${address}`);
        return creators.filter(creator => creator.walletAddress === address);
    }

    useEffect(() => {
        isWalletConnected();
    })
    return (
        <div className="App">
            <h1>Buy Me A Coffee</h1>
            {
                currentAccount ? (
                    <p>{currentAccount}</p>
                ) : (
                    <div>
                        <Button variant="primary" onClick={handleOpenSignUp}>Sign Up</Button>
                        <Button variant="outline-primary" onClick={handleConnectWallet}>Connect Wallet</Button>
                            <Modal show={isSignupModalOpen} onHide={handleCloseSignUp}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Sign Up</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form>
                                        <Form.Group className="mb-3" controlId="name">
                                            <Form.Label>Name</Form.Label>
                                            <Form.Control value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Enter your account name" />
                                            <Form.Text className="text-muted">
                                                Enter the name your subscribers will identify you as.
                                            </Form.Text>
                                        </Form.Group>
                                        <Form.Group className="mb-3" controlId="name">
                                            <Form.Label>About</Form.Label>
                                            <Form.Control value={about} onChange={e => setAbout(e.target.value)} type="text" placeholder="a brief description of what you or your content is about" />
                                            <Form.Text className="text-muted">
                                                Brief description of what you or your content is about
                                            </Form.Text>
                                        </Form.Group>
                                        <Form.Group className="mb-3" controlId="name">
                                            <Form.Label>Banner URL</Form.Label>
                                            <Form.Control value={bannerURL} onChange={e => setBannerURL(e.target.value)} type="text" placeholder="Image url of your banner" />
                                            <Form.Text className="text-muted">
                                                Image url of your banner
                                            </Form.Text>
                                        </Form.Group>
                                    </Form>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="danger" onClick={handleCloseSignUp}>
                                        Close
                                    </Button>
                                    <Button variant="primary" onClick={handleSignUp}>
                                        Save Changes
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                    </div>
                )
            }
            {/*list content creators*/}
            <div>
                <h3>Content Creators</h3>
                <div className="container">
                    <div>
                        <ListGroup as="ol" numbered>
                            {currentAccount && (creators.map((creator, id) => {
                                return (
                                    <div>
                                        <ListGroup.Item
                                            as="li"
                                            className="d-flex justify-content-between align-items-start"
                                            key={id}
                                        >
                                            <div className="ms-2 me-auto">
                                                <div className="fw-bold">
                                                    <a href="#" onClick={() => handleSetCreatorDetail(creator)}>{creator.name}</a>
                                                </div>
                                                {creator.about}
                                            </div>
                                            <Badge bg="primary" pill>
                                                14
                                            </Badge> Subscribers
                                        {/*<img src={creator.bannerURL} />*/}
                                        </ListGroup.Item>
                                    </div>
                            )
                        }))}
                        </ListGroup>
                    </div>
                    <div>
                        {creatorDetail && <CreatorDetail creatorDetail={creatorDetail}/>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
