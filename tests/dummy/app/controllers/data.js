import Ember from 'ember';
import Employee from '../models/employee';

export default Ember.Controller.extend({
  chosenEmployees: Ember.A(),
  Employee: Employee
});
