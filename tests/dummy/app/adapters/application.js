import DS from "ember-data";
import FixtureAdapter from 'ember-data-fixture-adapter';

FixtureAdapter.reopen({
  simulateRemoteResponse: true,
  queryFixtures: function(fixtures, query){
    return fixtures.filter(function(employee){
      var fullName =  employee.firstName + " " + employee.surname;
      return fullName.toLowerCase().search(query.fullName.toLowerCase()) !== -1;
    });
  }
});

export default FixtureAdapter;
