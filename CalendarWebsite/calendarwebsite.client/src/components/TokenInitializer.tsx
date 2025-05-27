import { useEffect, useState } from "react";
import { AuthService } from "../services/AuthServices";

export const TokenInitializer: React.FC<{onComplete: () => void}> = ({onComplete}) => {
    const [, setInitialized] = useState(false);

    useEffect(() => {
        AuthService.getTokenFromUrl();
        setInitialized(true);
        onComplete();
    }, [onComplete]);

    return null;
}
