//attaches axios interceptors to req + res axios instances

import { axiosPrivate } from "../api/axios";
import { useEffect } from "react";
import useRefreshToken from "./useRefreshToken";
import useAuth from "./useAuth";

const useAxiosPrivate = () =>{
    const refresh = useRefreshToken();
    const {auth} = useAuth();

    useEffect(() => {

        const requestIntercept = axiosPrivate.interceptors.request.use(
            config =>{
                if (!config.headers['Authorization']){ //if this doesn't exist, we know not a retry (therefore first attempt)
                    config.headers['Authorization'] = `Bearer ${auth?.accessToken}`;
                }
                // if header already exists, we know it was after the retry (403 error request)
                return config;
            }, (err) => Promise.reject(err)
        );

        const responseIntercept = axiosPrivate.interceptors.response.use(
            (response) => response, //if response is good, just return response
            async(err) =>{ //otherwise (e.g if access token expires)
                const prevRequest = err?.config;
                if(err?.response?.status === 403 && !prevRequest?.sent){ //403 means if expired access token, !prevRequest?.sent is for checking if wasn't sent so not in endless 403 loop (only want to retry once) 
                    prevRequest.sent = true;
                    const newAccessToken = await refresh();
                    prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return axiosPrivate(prevRequest); //have updated request w/ new token, then making request again
                }
                return Promise.reject(err);
            }
        );

        return ()=>{ //prevent from piling up over time
            axiosPrivate.interceptors.request.eject(requestIntercept);
            axiosPrivate.interceptors.response.eject(responseIntercept);
        }
    },[auth, refresh])

    return axiosPrivate;
}

export default useAxiosPrivate;