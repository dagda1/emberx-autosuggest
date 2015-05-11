import DS from "ember-data";

var FixtureAdapter = DS.FixtureAdapter.extend({
  simulateRemoteResponse: true
});

FixtureAdapter.reopen({
  queryFixtures: function(fixtures, query){
    return fixtures.filter(function(employee){
      var fullName =  employee.firstName + " " + employee.surname;
      return fullName.toLowerCase().search(query.fullName.toLowerCase()) !== -1;
    });
  }
});

export default FixtureAdapter;
