import FastDomainAddress from "../contracts/FastDomainAddress.json";
import BigNumber from "bignumber.js"
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import{ NotificationInfo, NotificationSuccess, NotificationError } from "../components/ui/Notifications"


export const approve = async (tokenContract, performActions) => {
    try {
        await performActions(async (kit) => {
            const {defaultAccount} = kit;
            let amountToApprove = new BigNumber(1).shiftedBy(18).toString()
            await tokenContract.methods.approve(FastDomainAddress?.FastDomain, amountToApprove).send({from: defaultAccount});
            toast(<NotificationSuccess text="Approval Successfull...." />); 
        });
    } catch (e) {
        console.log({e});
        toast(<NotificationError text="OOps, Approval Failed." />);
    }

    return "done";
}


export const mintToken = async (fastDomainContract, performActions) => {
    try {
        await performActions(async (kit) => {
            const {defaultAccount} = kit;
            await fastDomainContract.methods.mintToken().send({from: defaultAccount});
        });
    } catch (e) {
        console.log({e});
    }
};

// export const registerFastDomain = async (fastDomainContract, performActions, domainName) => {
//     try {
//         await performActions(async (kit) => {
//             console.log("registerFastDomain", domainName)
//             const {defaultAccount} = kit;
//             await fastDomainContract.methods.registerFastDomain(domainName).send({from: defaultAccount});
//         });
//     } catch (e) {
//         console.log({e});
//     }
// };


export const reassignDomain = async (fastDomainContract, performActions, newDomainName) => {
    try {
        await performActions(async (kit) => {
            const {defaultAccount} = kit;
            await fastDomainContract.methods.reassignDomain(newDomainName, defaultAccount).send({from: defaultAccount});
            toast(<NotificationSuccess text={ <span>  {defaultAccount} is now registered as  {newDomainName} &#127881; </span> }/>);
        });
    } catch (e) {
        toast(<NotificationError text="Not enought Token" />);
        console.log({e});
    }
};


export const getConnectedAddressDomain = async (fastDomainContract, performActions) => {
    try {

        await performActions(async (kit) => {
            const {defaultAccount} = kit;
            const value =  await fastDomainContract.methods.getDomain(defaultAccount).call();
            if (value === undefined || value === ""){
                toast(<NotificationInfo text={"You don't have a domain yet" }/>); 
            } else{
              toast(<NotificationInfo text={ <span> Welcome {value}</span> } />); 
            }
        });


    } catch (e) {
        console.log({e});
    }
};

export const isDomainRegistered = async (fastDomainContract, domainName) => {
    try {
        const value =  await fastDomainContract.methods.isDomainRegistered(domainName).call();
        if(value === true){
            toast(<NotificationSuccess text="Domain name already Taken"/>);
            return;
        }
        return value;
    } catch (e) {
        console.log({e});
    }
};

export const getAllregisteredDomains = async (fastDomainContract) => {
    try {

        const value =  await fastDomainContract.methods.getAllregisteredDomains().call();
        return value
    } catch (e) {
        console.log({e});
    }
};

export const getDomain = async (fastDomainContract, Useraddresss) => {
    try {
        const value =  await fastDomainContract.methods.getDomain(Useraddresss).call();
        return value
    } catch (e) {
        console.log({e});
    }
};