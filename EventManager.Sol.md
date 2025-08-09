// SPDX-License-Identifier: MIT  
pragma solidity ^0.8.20;

import "./TicketNFT.sol";  
import "@openzeppelin/contracts/access/Ownable.sol";  
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";  
import "@openzeppelin/contracts/utils/Counters.sol";

/\*\*  
 \* @title EventManager  
 \* @dev Manages events and ticket sales using TicketNFT contract  
 \* Compatible with Avalanche Fuji testnet  
 \*/  
contract EventManager is Ownable, ReentrancyGuard {  
    using Counters for Counters.Counter;

    // Counter for event IDs  
    Counters.Counter private \_eventIdCounter;

    // TicketNFT contract instance  
    TicketNFT public ticketNFT;

    // Event structure  
    struct Event {  
        uint256 eventId;  
        string name;  
        string date;  
        string venue;  
        uint256 supply;  
        uint256 price;  
        uint256 resaleLimit;  
        uint256 ticketsSold;  
    }

    // Mapping from event ID to Event  
    mapping(uint256 \=\> Event) public events;

    // Mapping to track resale count for each token  
    mapping(uint256 \=\> uint256) public tokenResaleCount;

    // Mapping to track which event a token belongs to (for efficient lookups)  
    mapping(uint256 \=\> uint256) public tokenToEventId;

    // Events  
    event EventCreated(  
        uint256 indexed eventId,  
        string name,  
        string date,  
        string venue,  
        uint256 supply,  
        uint256 price,  
        uint256 resaleLimit  
    );

    event TicketPurchased(  
        uint256 indexed eventId,  
        uint256 indexed tokenId,  
        address indexed buyer,  
        string seat,  
        uint256 price  
    );

    event ResaleValidated(  
        uint256 indexed tokenId,  
        uint256 indexed eventId,  
        uint256 resaleCount  
    );

    // Custom errors for better gas efficiency  
    error InsufficientPayment(uint256 required, uint256 provided);  
    error EventSoldOut(uint256 eventId);  
    error EventNotFound(uint256 eventId);  
    error TokenNotFound(uint256 tokenId);  
    error ResaleLimitExceeded(uint256 tokenId, uint256 limit);  
    error InvalidSupply();  
    error InvalidPrice();  
    error EmptyString();

    /\*\*  
     \* @dev Constructor that deploys a TicketNFT instance  
     \* @param ticketName The name for the TicketNFT collection  
     \* @param ticketSymbol The symbol for the TicketNFT collection  
     \*/  
    constructor(  
        string memory ticketName,  
        string memory ticketSymbol  
    ) Ownable(msg.sender) {  
        // Deploy TicketNFT contract instance  
        ticketNFT \= new TicketNFT(ticketName, ticketSymbol);  
          
        // Start event IDs from 1  
        \_eventIdCounter.increment();  
    }

    /\*\*  
     \* @dev Creates a new event (only owner can call)  
     \* @param name The name of the event  
     \* @param date The date of the event  
     \* @param venue The venue where the event takes place  
     \* @param supply The total number of tickets available  
     \* @param price The price per ticket in wei  
     \* @param resaleLimit The maximum number of times a ticket can be resold  
     \*/  
    function createEvent(  
        string memory name,  
        string memory date,  
        string memory venue,  
        uint256 supply,  
        uint256 price,  
        uint256 resaleLimit  
    ) external onlyOwner {  
        // Input validation  
        if (bytes(name).length \== 0\) revert EmptyString();  
        if (bytes(date).length \== 0\) revert EmptyString();  
        if (bytes(venue).length \== 0\) revert EmptyString();  
        if (supply \== 0\) revert InvalidSupply();  
        if (price \== 0\) revert InvalidPrice();

        uint256 eventId \= \_eventIdCounter.current();  
        \_eventIdCounter.increment();

        // Create and store the event  
        events\[eventId\] \= Event({  
            eventId: eventId,  
            name: name,  
            date: date,  
            venue: venue,  
            supply: supply,  
            price: price,  
            resaleLimit: resaleLimit,  
            ticketsSold: 0  
        });

        emit EventCreated(eventId, name, date, venue, supply, price, resaleLimit);  
    }

    /\*\*  
     \* @dev Purchases a ticket for a specific event  
     \* @param eventId The ID of the event to purchase a ticket for  
     \* @param seat The seat assignment for the ticket  
     \*/  
    function buyTicket(  
        uint256 eventId,  
        string memory seat  
    ) external payable nonReentrant {  
        Event storage eventInfo \= events\[eventId\];  
          
        // Validate event exists  
        if (eventInfo.eventId \== 0\) revert EventNotFound(eventId);  
          
        // Validate payment  
        if (msg.value \!= eventInfo.price) {  
            revert InsufficientPayment(eventInfo.price, msg.value);  
        }  
          
        // Check if tickets are still available  
        if (eventInfo.ticketsSold \>= eventInfo.supply) {  
            revert EventSoldOut(eventId);  
        }  
          
        // Validate seat is not empty  
        if (bytes(seat).length \== 0\) revert EmptyString();

        // Increment tickets sold  
        eventInfo.ticketsSold++;

        // Mint the ticket NFT  
        ticketNFT.mintTicket(  
            eventId,  
            msg.sender,  
            eventInfo.name,  
            eventInfo.date,  
            eventInfo.venue,  
            seat  
        );

        // Get the token ID that was just minted  
        uint256 tokenId \= ticketNFT.getCurrentTokenId() \- 1;  
          
        // Map token to event for efficient lookups  
        tokenToEventId\[tokenId\] \= eventId;

        emit TicketPurchased(eventId, tokenId, msg.sender, seat, eventInfo.price);  
    }

    /\*\*  
     \* @dev Validates if a token can be resold based on resale limits  
     \* @param tokenId The token ID to validate for resale  
     \* @return bool Whether the resale is valid  
     \*/  
    function validateResale(uint256 tokenId) external returns (bool) {  
        // Check if token exists  
        if (\!ticketNFT.exists(tokenId)) revert TokenNotFound(tokenId);  
          
        uint256 eventId \= tokenToEventId\[tokenId\];  
        Event memory eventInfo \= events\[eventId\];  
          
        // Check resale limit  
        uint256 currentResaleCount \= tokenResaleCount\[tokenId\];  
        if (currentResaleCount \>= eventInfo.resaleLimit) {  
            revert ResaleLimitExceeded(tokenId, eventInfo.resaleLimit);  
        }

        // Increment resale count  
        tokenResaleCount\[tokenId\]++;

        emit ResaleValidated(tokenId, eventId, tokenResaleCount\[tokenId\]);  
          
        return true;  
    }

    /\*\*  
     \* @dev Marks tickets as attended (only owner can call)  
     \* @param tokenIds Array of token IDs to mark as attended  
     \*/  
    function markTicketsAsAttended(uint256\[\] calldata tokenIds) external onlyOwner {  
        for (uint256 i \= 0; i \< tokenIds.length; i++) {  
            ticketNFT.markAsAttended(tokenIds\[i\]);  
        }  
    }

    /\*\*  
     \* @dev Withdraws contract balance to owner  
     \*/  
    function withdraw() external onlyOwner {  
        uint256 balance \= address(this).balance;  
        require(balance \> 0, "EventManager: no funds to withdraw");  
          
        (bool success, ) \= payable(owner()).call{value: balance}("");  
        require(success, "EventManager: withdrawal failed");  
    }

    /\*\*  
     \* @dev Emergency withdrawal function with specific amount  
     \* @param amount Amount to withdraw in wei  
     \*/  
    function emergencyWithdraw(uint256 amount) external onlyOwner {  
        require(amount \<= address(this).balance, "EventManager: insufficient balance");  
        require(amount \> 0, "EventManager: amount must be greater than 0");  
          
        (bool success, ) \= payable(owner()).call{value: amount}("");  
        require(success, "EventManager: emergency withdrawal failed");  
    }

    /\*\*  
     \* @dev Returns event information  
     \* @param eventId The event ID to get information for  
     \* @return The Event struct containing all event details  
     \*/  
    function getEvent(uint256 eventId) external view returns (Event memory) {  
        if (events\[eventId\].eventId \== 0\) revert EventNotFound(eventId);  
        return events\[eventId\];  
    }

    /\*\*  
     \* @dev Returns the current event ID counter  
     \* @return The next event ID that will be created  
     \*/  
    function getCurrentEventId() external view returns (uint256) {  
        return \_eventIdCounter.current();  
    }

    /\*\*  
     \* @dev Returns the total number of events created  
     \* @return The total number of events  
     \*/  
    function getTotalEvents() external view returns (uint256) {  
        return \_eventIdCounter.current() \- 1;  
    }

    /\*\*  
     \* @dev Checks if an event exists  
     \* @param eventId The event ID to check  
     \* @return Whether the event exists  
     \*/  
    function eventExists(uint256 eventId) external view returns (bool) {  
        return events\[eventId\].eventId \!= 0;  
    }

    /\*\*  
     \* @dev Returns available tickets for an event  
     \* @param eventId The event ID to check  
     \* @return The number of available tickets  
     \*/  
    function getAvailableTickets(uint256 eventId) external view returns (uint256) {  
        if (events\[eventId\].eventId \== 0\) revert EventNotFound(eventId);  
        Event memory eventInfo \= events\[eventId\];  
        return eventInfo.supply \- eventInfo.ticketsSold;  
    }

    /\*\*  
     \* @dev Returns resale count for a token  
     \* @param tokenId The token ID to check  
     \* @return The number of times the token has been resold  
     \*/  
    function getTokenResaleCount(uint256 tokenId) external view returns (uint256) {  
        return tokenResaleCount\[tokenId\];  
    }

    /\*\*  
     \* @dev Returns the event ID associated with a token  
     \* @param tokenId The token ID to check  
     \* @return The event ID the token belongs to  
     \*/  
    function getTokenEventId(uint256 tokenId) external view returns (uint256) {  
        return tokenToEventId\[tokenId\];  
    }

    /\*\*  
     \* @dev Returns contract balance  
     \* @return The contract's current balance in wei  
     \*/  
    function getContractBalance() external view returns (uint256) {  
        return address(this).balance;  
    }

    /\*\*  
     \* @dev Returns the address of the TicketNFT contract  
     \* @return The TicketNFT contract address  
     \*/  
    function getTicketNFTAddress() external view returns (address) {  
        return address(ticketNFT);  
    }

    /\*\*  
     \* @dev Batch function to get multiple events  
     \* @param eventIds Array of event IDs to retrieve  
     \* @return events Array of Event structs  
     \*/  
    function getMultipleEvents(uint256\[\] calldata eventIds)   
        external   
        view   
        returns (Event\[\] memory)   
    {  
        Event\[\] memory result \= new Event\[\](eventIds.length);  
        for (uint256 i \= 0; i \< eventIds.length; i++) {  
            if (events\[eventIds\[i\]\].eventId \== 0\) revert EventNotFound(eventIds\[i\]);  
            result\[i\] \= events\[eventIds\[i\]\];  
        }  
        return result;  
    }

    /\*\*  
     \* @dev Fallback function to reject direct ETH transfers  
     \*/  
    receive() external payable {  
        revert("EventManager: direct transfers not allowed");  
    }  
}  
