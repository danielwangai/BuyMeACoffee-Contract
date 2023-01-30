import {Image, Nav} from "react-bootstrap";
import Button from "react-bootstrap/Button";

function CreatorDetail(props) {
    console.log("Props: ", props);
    return(
        <div>
            <div className="creator-detail">
                <div className="creator-top-section">
                    <div>
                        <img className="banner-image" src={props.creatorDetail.bannerURL} />
                    </div>
                    <div className="description-section">
                        <div className="name-and-subscribe">
                            <div>
                                <h3>{props.creatorDetail.name}</h3>
                            </div>
                            <div>
                                <Button variant="primary">Subscribe</Button>
                            </div>
                        </div>
                            <div>{props.creatorDetail.about}</div>
                    </div>
                </div>
                <div className="creator-content-section">
                    <p>Content goes here</p>
                </div>
            </div>
        </div>
    );
}

export default CreatorDetail;
