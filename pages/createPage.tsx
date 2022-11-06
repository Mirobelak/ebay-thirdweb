import React from 'react'
import Header from '../components/Header'
import {useAddress, useContract, MediaRenderer, useNetwork, useNetworkMismatch, useOwnedNFTs, useCreateAuctionListing, useCreateDirectListing} from '@thirdweb-dev/react'
import {useRouter} from 'next/router'
import network from '../utils/network'
import {NFT, NATIVE_TOKENS, NATIVE_TOKEN_ADDRESS} from '@thirdweb-dev/sdk'
import toast, {Toaster} from 'react-hot-toast'

type Props = {}

const CreatePage = (props: Props) => {
    const {contract} = useContract(process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT, "marketplace")
    const {contract: collectionContract} = useContract(process.env.NEXT_PUBLIC_COLLECTION_CONTRACT, "nft-collection")
    const address = useAddress()
    const router = useRouter()
    const ownedNFTs = useOwnedNFTs(collectionContract, address)
    const networkMismatch = useNetworkMismatch()
    const [, switchNetwork] = useNetwork()
    const {mutate: createDirectListing, isLoading: isLoadingDirect, error: errorDirect} = useCreateDirectListing(contract)
    const {mutate: createAuctionListing, isLoading: isLoadingAuction, error: errorAuction} = useCreateAuctionListing(contract)
    const [selectedNFT, setSelectedNFT] = React.useState<NFT>()

    const handleDreateListing = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if(networkMismatch) {
            switchNetwork && switchNetwork(network)
            return
        }
        if(!selectedNFT) return;
            const target = e.target as typeof e.target & {
                elements: {listingType: {value: string};
                price: {value: string}}
            }
            const {listingType, price} = target.elements

            if(listingType.value === "direct") {
                createDirectListing({assetContractAddress: process.env.NEXT_PUBLIC_COLLECTION_CONTRACT!, tokenId: selectedNFT.metadata.id, currencyContractAddress: NATIVE_TOKEN_ADDRESS, listingDurationInSeconds: 60 * 60 * 24 * 7, quantity: 1, buyoutPricePerToken:price.value,startTimestamp: new Date()}, {onSuccess(data, variables, context) { console.log("SUCCES" + data, variables, context);
                toast.success("Listing created successfully") 
                router.push("/")},
                onError(error, variables, context)
                { console.log("ERROR" + error, variables, context) 
                toast.error("Listing creation failed")}})
            }
            else if(listingType.value === "auction") {
                createAuctionListing(
                    {assetContractAddress: process.env.NEXT_PUBLIC_COLLECTION_CONTRACT!, 
                    tokenId: selectedNFT.metadata.id, 
                    currencyContractAddress: NATIVE_TOKEN_ADDRESS, 
                    listingDurationInSeconds: 60 * 60 * 24 * 7, 
                    quantity: 1,
                    startTimestamp: new Date(),
                    buyoutPricePerToken:price.value,
                    reservePricePerToken: 0,}, 
                    {onSuccess(data, variables, context) { console.log("SUCCES" + data, variables, context); 
                router.push("/")},
                onError(error, variables, context) { console.log("ERROR" + error, variables, context);}})
            }

        } 
    return (
    <div>
        <Toaster position='top-center'/>
        <Header/>
        <main className='max-w-6xl mx-auto p-2'>
        <h1 className='text-4xl font-bold'>List an Item</h1>
        <h2 className='text-xl font-semibold'>Select an Item you wold like to sell</h2>

        <hr className='mb-5' />
        <p>Below you will see your NFTs</p>
        <div className='flex overflow-x-scroll p-4 space-x-2'>
            {ownedNFTs?.data?.map((nft) => (
            <div key={nft.metadata.id} onClick={() => setSelectedNFT(nft)} className={`flex flex-col space-y-2 card min-w-fit border-2 bg-gray-100 ${nft.metadata.id === selectedNFT?.metadata.id ? "border-black" : "border-transparent"} `}>
                <MediaRenderer className='h-48 rounded-lg' src={nft.metadata.image} />
                <p className='text-lg font-bold truncate'>{nft.metadata.name}</p>
                <p className='text-xs truncate'>{nft.metadata.description}</p>
                </div>
            ))}
        </div>
        {selectedNFT && (
            <form onSubmit={handleDreateListing}  className='flex w-full h-fit mx-auto justify-center'>
            <div className='flex flex-col space-y-4 w-[500px]' >
                <div className='flex flex-col p-10'>
                    <label className='border-r font-light'>Direct Listing / Fixed Price</label>
                    <input className='ml-auto h-10 w-10 relative bottom-8' type="radio" name="listingType" value="direct" />
                    <label className='border-r font-light'>Auction</label>
                    <input className='ml-auto h-10 w-10 relative bottom-8 ' type="radio" name="listingType" value="auction" />
                    <label className='font-light border-r'>Price</label>
                    <input className='bg-gray-100 p-5' type="text" name="price" placeholder='0.05' />
                </div>
                <button type="submit" className='bg-blue-600 text-white rounded-lf p-4 mt-8'>Create Listing</button>
            </div>
            </form>
        )}
        </main>
    </div>
  )
}

export default CreatePage