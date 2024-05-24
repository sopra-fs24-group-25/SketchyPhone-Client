import React, { useState, useRef, useMemo } from "react";
import BaseContainer from "components/ui/BaseContainer";
import { BurgerMenu } from "components/ui/BurgerMenu";
import Menu from "components/ui/Menu";
import "styles/views/Game.scss";
import "styles/views/GameRoom.scss";
import User from "../../models/User";
import { useNavigate } from "react-router-dom";
import { BackButton } from "components/ui/BackButton";
import "styles/views/GameJoin.scss";
import AvatarDrawer from "components/ui/AvatarDrawer";

const DrawAvatar = () => {

    const navigate = useNavigate();

    const [openMenu, setOpenMenu] = useState<boolean>(false);


    // main objects we need for the application logic
    const user = useRef<User>(new User(JSON.parse(sessionStorage.getItem("user"))));

    const toggleMenu = () => {
        setOpenMenu(!openMenu);
    }

    const DrawView = React.memo(() => {

        return (
            <BaseContainer>
                <div className="gameroom header">
                    <BurgerMenu
                        onClick={() => setOpenMenu(!openMenu)}
                        disabled={openMenu}>
                    </BurgerMenu>
                </div>
                <div className={`join container-${"up"}`}>
                    <BackButton
                        onClick={() => navigate("/join")}
                    ></BackButton>
                    <AvatarDrawer
                        height={400}
                        width={400}
                        user={user.current}>
                    </AvatarDrawer>
                    <div className="mascot">
                        <img src={require("../../icons/ChubbyGuy.png")} alt="Chubby Guy" draggable="false" />
                    </div>
                </div>
                {Menu(openMenu, toggleMenu, user.current.persistent, false)}
            </BaseContainer>
        );
    })

    DrawView.displayName = "DrawView";


    const renderComponent = useMemo(() => {
        return <DrawView/>

    }, [openMenu, user]);

    return renderComponent;
};

export default DrawAvatar;
