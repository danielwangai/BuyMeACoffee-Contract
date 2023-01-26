import logo from './logo.svg';
import abi from './utils/BuyMeACoffee.json';
import {useEffect, useState} from "react";
import { ethers } from "ethers";

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

function App() {
    // Contract Address & ABI
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const contractABI = abi.abi;

    const [currentAccount, setCurrentAccount] = useState("");
    const [creators, setCreators] = useState([]);
    const [isSignupModalOpen, setSignupModal] = useState(false);
    const [name, setName] = useState("");
    const [about, setAbout] = useState("");
    const [bannerURL, setBannerURL] = useState("");

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
                connectWallet();

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
                        <Button variant="primary" onClick={handleOpenSignUp}>Signup</Button>
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
                                            <Form.Label>Name</Form.Label>
                                            <Form.Control value={about} onChange={e => setAbout(e.target.value)} type="text" placeholder="a brief description of what you or your content is about" />
                                            <Form.Text className="text-muted">
                                                Brief description of what you or your content is about
                                            </Form.Text>
                                        </Form.Group>
                                        <Form.Group className="mb-3" controlId="name">
                                            <Form.Label>Name</Form.Label>
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
            {currentAccount && (creators.map((creator, id) => {
                console.log("Creator: ", creator, id)
                return (
                    <div key={id}>
                        <p>{creator.name}</p>
                        <p>{creator.about}</p>
                        <img src={creator.bannerURL} />
                    </div>
                )
            }))}
        </div>
    );
}

export default App;
