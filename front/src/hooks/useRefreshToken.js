import axios from "../api/axios"
import useAuth from "./useAuth"

const useRefreshToken = () => {
    const {setAuth} = useAuth();

    //uses refresh function to request new access token
    const refresh = async() => {
        const response = await axios.get('/api/refresh',{
            withCredentials:true, //allows cookies to be sent w/ request (response token)
        });
        setAuth(prev =>{
            console.log(JSON.stringify(prev));
            console.log(response.data.accessToken);
            return{...prev,
                user:response.data.user,
                coins: response.data.coins, 
                accessToken: response.data.accessToken}
        })
        return response.data.accessToken
    }   

    return refresh;
};

export default useRefreshToken;