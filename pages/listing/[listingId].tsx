import React, { useEffect } from 'react'
import {useRouter} from 'next/router'
import Header from '../../components/Header'
import { MediaRenderer, useListing,useContract,useNetwork, useNetworkMismatch, useMakeBid, useMakeOffer, useBuyNow, useOffers, useAddress,useAcceptDirectListingOffer } from '@thirdweb-dev/react'
import { UserCircleIcon } from '@heroicons/react/24/solid'
import { ListingType, NATIVE_TOKENS } from '@thirdweb-dev/sdk'
import CountDown from "react-countdown"
import network from '../../utils/network'
import { ethers } from 'ethers'
import toast, {
    Toaster
  } from 'react-hot-toast';
type Props = {}

const ListingPage = (props: Props) => {
    const router = useRouter()
    const address = useAddress()
    const [minimumNextBid, setMinimumNextBid] = React.useState<{displayValue: string, symbol: string}>()
    const [bidAmount, setBidAmount] = React.useState<string>("")
    const {listingId} = router.query as {listingId: string}
    const [, switchNetwork] = useNetwork()
    const networkMismatch = useNetworkMismatch()
    const {contract} = useContract(process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT, "marketplace")
    const {data: listing, isLoading,error} = useListing(contract, listingId)
    const {mutate: buyNow} = useBuyNow(contract);
    const {mutate: makeOffer} = useMakeOffer(contract);
    const offers = useOffers(contract, listingId);
    const {mutate: makeBid} = useMakeBid(contract);
    const {mutate: acceptOffer} = useAcceptDirectListingOffer(contract);

    useEffect(() => {
        if(!listing || !contract || !listingId) return
        if(listing.type === ListingType.Auction) {
            fetchMinNextBid()
        }
    }, [listing, contract, listingId])

    const fetchMinNextBid = async () => {
        if(!listingId || !contract) return
        const {displayValue,symbol} = await contract.auction.getMinimumNextBid(listingId)

        setMinimumNextBid({
            displayValue: displayValue,
            symbol: symbol
        })
    }

    const createBidOrOffer = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
       
        try {
            if(networkMismatch) {
                switchNetwork && switchNetwork(network)
                return
            }
            if(listing?.type === ListingType.Direct) {
                if(listing.buyoutPrice.toString() === ethers.utils.parseEther(bidAmount).toString()) {
                    console.log("BUY NOW PRICE WAS SELECTED")
                    buyNFT()
                    return
                }
                makeOffer({ quantity: 1, pricePerToken: bidAmount, listingId }, {
                    onSuccess: (data, variables, context) => {
                        setBidAmount("")
                        alert("Offer was successfully made")
                    }, onError: (error, variables, context) => {
                        alert("Error making offer")
                    }
                })
            }
            if(listing?.type === ListingType.Auction) {
                makeBid({ bid: bidAmount,listingId }, {
                    onSuccess: (data, variables, context) => {
                        alert("Bid was successfully made")
                        setBidAmount("")
                    }, onError: (error, variables, context) => {
                        alert("Error making bidding")
                    }
                })
            }
    }
        catch (error) {
            console.log(error)
        }
    }



    if (isLoading) return <div className='text-3xl text-center animate-pulse'>Loading...</div>
    if (error) return <>Error: {error}</>
    if (!listing) return <div>Listing not found</div>

    const formatPlaceholder = () => {
        if (listing.type === ListingType.Direct) {
            return "Enter Offer amount"
        } 
        if(listing.type === ListingType.Auction) {
            
            return Number(minimumNextBid?.displayValue) === 0 ? "Enter Bid amount" : `${minimumNextBid?.displayValue} ${minimumNextBid?.symbol}) or more`

        }
    } 

    const buyNFT = async () => {
        if(networkMismatch) {
            switchNetwork && switchNetwork(network)
            return
        }
        await buyNow({buyAmount: 1, type: listing.type, id: listingId}, {
            onSuccess: (data, variables, context) => {
                toast.success('NFT BOUGHT')
                router.replace('/')
            },
            onError: (error, variables, context) => {
                toast.error('Error buying NFT')
                
            }
        })

    }

    return (
    <div>
        <Toaster
         position="top-center"
        />
        <Header/>
        <main className='max-w-6xl p-2 flex mx-auto flex-col lg:flex-row space-y-10 space-x-5 pr-10'>
            <div className='p-10 border mx-auto lg:mx-0 max-w-md lg:max-w-xl'>
                <MediaRenderer src={listing?.asset.image}/>
            </div>
            <section className='flex-1 space-y-5 pb-20 lg:pb-0'>
                <div>
                    <h1 className='font-bold text-xl'>{listing.asset.name}</h1>
                    <p>{listing.asset.description}</p>
                    <p className='flex items-center text-xs sm:text-base'>
                        <UserCircleIcon className='h-5 '/>
                        <span className='pr-1 font-bold' >Seller: </span>
                        {listing.sellerAddress}</p>
                </div>
                <div className='gird grid-cols-2 items-center py-2'>
                <p className='font-bold'>Listing type: </p>
                <p className=''>{listing.type === ListingType.Direct ? "Direct Listing" : "Auction Listing"}</p>
                <p className='font-bold'>Buy it Now Price: </p>
                <p className='font-bold text-4xl'>{listing.buyoutCurrencyValuePerToken.displayValue} {listing.buyoutCurrencyValuePerToken.symbol}</p>
                <button onClick={buyNFT} className='col-start-2 mt-2 bg-blue-600 font-bold text-white rounded-full w-44 py-4 px-10'>Buy Now</button>
                </div>
                {listing.type === ListingType.Direct && offers?.data && (
                    <div className='grid grid-cols-2 gap-y-2'>
                        <p className='font-bold'>Offers: </p>
                        <p className='font-bold'>{offers.data.length > 0 ? offers.data.length : 0}</p>
                        {offers?.data?.map((offer) => (
                            <>
                            <p className='flex items-center ml-5 text-sm italic'>
                                <UserCircleIcon className='h-3 mr-2'/>
                                {offer.offerrer.slice(0, 6) + "..." + offer.offerrer.slice(-5)}
                            </p>
                            <div>
                                <p className='text-sm italic' key={offer.listingId + offer.offeror + offer.totalOfferAmount.toString()}>
                                    {ethers.utils.formatEther(offer.totalOfferAmount)}{""}{NATIVE_TOKENS[network].symbol}
                                </p>
                                {listing.sellerAddress === address && (
                                    <button className='p-2 w-32 bg-red-500/50 rounded-lg font-bold text-xs cursor-pointer' onClick={()=> acceptOffer({
                                        listingId: offer.listingId,
                                        addressOfOfferor: offer.offeror,
                                    },
                                    { onSuccess(data, variables, context) {
                                        alert("Offer accepted")
                                        router.replace('/')
                                    }, onError(error, variables, context) {
                                        alert("Error accepting offer")
                                    }
                                }
                                    )} >Accept Offer</button>
                                )}
                            </div>
                            </>
                        ))}
                    </div>
                )}
                <div className='grid grid-cols space-y-2 items-center justify-end'>
                    <hr className='col-span-2' />
                    <p className='col-span-2 font-bold'>{listing.type === ListingType.Direct ? "Make an offer" : "Bid on this auction"}</p>
                    {listing.type === ListingType.Auction && 
                    <>
                    <p>Current Minimum bid:</p>
                    <p>{minimumNextBid?.displayValue} {minimumNextBid?.symbol}</p>
                    <p>Time remaining</p>
                   <CountDown date={Number(listing.endTimeInEpochSeconds.toString()) *1000}  />
                    </>}
                    <input className='border p-2 rounded-lg mr-5' type="text" placeholder={formatPlaceholder()} onChange={e => setBidAmount(e.target.value)} />
                    <button onClick={createBidOrOffer} className='bg-red-600 font-bold text-white rounded-full w-44 py-4 px-10 '>{listing.type === ListingType.Direct ? "Offer" : "Bid"}</button>
                </div>
            </section>
        </main>
    </div>
  )
}

export default ListingPage