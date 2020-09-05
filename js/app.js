const contract_address = "0xdD9F565737e29608e48c9135640835565A226a57";
var account;
var contract;
var myVote;
var petdata;
var electionStatus ="Open";
var winnerId;
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
      petdata = data;
      console.log("petdata", petdata);
      document.getElementById("eventslog").innerHTML += 'Voting Started...' + "<br />";
      
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
    $(document).on('click', '.btn-adopt', App.voteFor);
    $(document).on('click', '.btn-result', App.refresh);
    $(document).on('click', '.btn-start', App.startElection);
    $(document).on('click', '.btn-end', App.endElection);
  },


  voteFor: async function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));
    var petadd = petdata[petId-1].address;
    console.log("petaddress: ", petadd);
    
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
          contract.vote(petId, petadd).send({from: account[0], candidateId: petId, gasPrice: 20000000000 ,gas: 300000}, function (err, res) {
            if (!err) {
              console.log("transaction:", res);                          
              document.getElementById("eventslog").innerHTML += 'Thank You for voting...' + "<br />"; 
              alert("We are registering your vote to the blockchain...please give us 15 seconds");
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


  refresh: async function(){

    this.accounts = await window.web3.eth.getAccounts();
    account = this.accounts;


    contract.totalVotes().call(function (err, res) {
      if (!err) {
        console.log("Total Votes", res);
        document.getElementById("total_votes").innerHTML = res;
      }
      else {
        console.log(err);
      }
    });


    contract.votes(account[0]).call(function (err, res) {
      if (!err) {
        console.log("res: ", res);
        if(res > 0){
        console.log("MyVote", petdata[res-1].name);
        document.getElementById("myVote").innerHTML = petdata[res-1].name;        
        }
      }
      else {
        console.log(err);
      }
    });

    contract.ended().call(function (err, res) {
      if (!err) {
        console.log("election status", res);        
        if (!res){
          electionStatus = "Open";
          document.getElementById("winner").innerHTML = "Voting is still going on...";
          
        }
        else{
          electionStatus = "Closed"; 
          document.getElementById("STATE").innerHTML = electionStatus;
          App.winner();           
          
        }
        document.getElementById("STATE").innerHTML = electionStatus;
      }
      else {
        console.log(err);
      }
    });
     
  },

  
  winner: async function(){

    contract.winnerCandidate().call(function (err, res) {
      if (!err) {
        console.log("winner", res[0]);
        var id = parseInt(res[0]);
        winnerId = res[1];
        document.getElementById("winner").innerHTML = petdata[res[0]-1].name +  " won by " + winnerId + " vote/s";        
        document.getElementById("eventslog").innerHTML = "Winner is..." + petdata[res[0]-1].name +"<br/>";        
        
        $("#myModal").modal('show');
        document.getElementById("displayAsset").innerHTML = petdata[res[0]-1].name +"<br/>";        
        setTimeout(function() {$('#myModal').modal('hide');}, 5000)
        console.log("maxvote", res[1]);                
      }
      else {
        console.log(err);
      }
    });
  },
  
  endElection: async function(){


    this.accounts = await window.web3.eth.getAccounts();
    account = this.accounts;

    console.log("endElection account ",account[0]);

    contract.electionEnd().send({from: account[0], gasPrice: 20000000000 ,gas: 300000}, function (err, res) {
      if (!err) {
        console.log("transaction:", res);                          
        document.getElementById("eventslog").innerHTML += "Election Ended..." + "<br/>";   
        App.refresh();
      }
      else {
        console.log(err);
        alert("You are not the FEC! You cannot end the election");
      }
    });
  },

  startElection: async function(){
    alert("Election is controlled by FEC! You cannot start/end the election");    

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
    
    this.init();  
  }

};

App.main();