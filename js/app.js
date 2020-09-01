const contract_address = "0x48A6994E9e3977a8d116DB8B0d76a3FD4169D418";
var account;
var contract;
App = {
  ethEnabled: function () {
    // If the browser has MetaMask installed

    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      window.ethereum.enable();
      return true;
    }
    return false;
  },


  init: async function() {

    contract = this.contract.methods;
    // Load pets.
    console.log("contracts: ", contract);

    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');
      console.log("data",data);

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        // petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.pet-address').text(data[i].address);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
      // App.markAdopted();
      
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {


    return App.initContract();
  },

  initContract: function() {
    /*
     * Replace me...
     */

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function() {

    // get the instance of our contract
    // return get All candidates 
    contract.getAllCandidates().call(function (err, res) {
      if (!err) {
        console.log("result",res.length);
        for (let index = 0; index < res.length; index++) {

          if(!web3.utils.toBN(res[i]).isZero()){
            $('.panel-pet').eq(i).find("button").text("Success").attr("disabled", true);
          }
          console.log(err);          
        }
      }
      else {
        console.log(err);
      }
    });

    console.log("markAdopted function:");
   
  },

  handleAdopt: async function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    this.accounts = await window.web3.eth.getAccounts();
    account = this.accounts;

    console.log("address:", account);
    console.log("petId:", petId);
    console.log("address:", account[0]);

    contract.votes(account[0]).call(function (err, res) {
    
      if (!err) {
        if(res == 0)
        {
          console.log("res is zero");
          contract.vote(petId).send({from: account[0], candidateId: petId, gasPrice: 20000000000 ,gas: 300000}, function (err, res) {
            if (!err) {
              console.log("transaction:", res);
              
            }
            else {
              console.log(err);
            }
          });

        }
        else{
          console.log("res is not zero");
          console.log("Already Voted", res);
          alert("You have already voted!!!");
         
        }
        
      }
      else {
        console.log(err);
      }
    });

    


  },


  main: async function () {
    // Initialize web3
    if (!App.ethEnabled()) {
      alert("Please install MetaMask to use this dApp!");
    }

    this.accounts = await window.web3.eth.getAccounts();
    this.bidder = this.accounts[0];
    account = this.accounts[0];
 
    account = this.accounts;
    this.votingABI = await (await fetch("Voting_abi.json")).json();

    this.contract = new window.web3.eth.Contract(
      this.votingABI,
      contract_address,
      // OLD web3 syntax { defaultAccount: this.accounts }
      {defaultAccount: this.accounts[0] }
    );
    console.log("Contract object", this.contract);

    // this.contract.methods.voters(0).call(function (err, res) {
    //   if (!err) {
    //     console.log("default account", res);
    //   }
    //   else {
    //     console.log(err);
    //   }
    // });
    
    this.init();  
  }

};

App.main();