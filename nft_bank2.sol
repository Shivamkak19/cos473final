// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TextNFT is ERC721 {
    uint256 public tokenIdCounter;
    mapping(uint256 => string) private _tokenText;

    constructor() ERC721("TextNFT", "TNFT") {}

    function createNFT(string memory text) external {
        uint256 tokenId = tokenIdCounter++;
        _mint(msg.sender, tokenId);
        _setTokenText(tokenId, text);
    }

    function getAllTextValues() external view returns (string[] memory) {
        string[] memory textValues = new string[](tokenIdCounter);
        for (uint256 i = 0; i < tokenIdCounter; i++) {
            textValues[i] = _tokenText[i];
        }
        return textValues;
    }
    function readText(uint256 tokenId) external view returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _tokenText[tokenId];
    }

    function _setTokenText(uint256 tokenId, string memory text) private {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        _tokenText[tokenId] = text;
    }

}
