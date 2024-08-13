// app/controllers/rekenhof.js
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import fetch from 'fetch';

export default class RekenhofController extends Controller {
  @service('current-session') currentSession;
  @tracked apiResults = null;

  @action
  async queryApi() {
    let uri = this.currentSession.group.uri;
    try {
      let response = await fetch(`http://localhost:1234/sparql-query?bestuurseenheid=${uri}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      let contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        let text = await response.text();
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error("Received non-JSON response:", text);
          throw new TypeError("Received non-JSON response");
        }
      }
    this.apiResults = data.results.bindings.map(binding => {
      let geslacht = binding.geslacht?.value;
      if (geslacht === "http://publications.europa.eu/resource/authority/human-sex/FEMALE") {
        geslacht = "Vrouw";
      } else if (geslacht === "http://publications.europa.eu/resource/authority/human-sex/MALE") {
        geslacht = "Man";
      }
    
      const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('nl-NL', options);
      };
    
      return {
        voornaam: binding.voornaam?.value,
        achternaam: binding.achternaam?.value,
        geboortedatum: binding.geboortedatum?.value,
        geslacht: geslacht,
        rrn: binding.rrn?.value,
        bestuursorgaanTijdsspecialisatieLabel: binding.bestuursorgaanTijdsspecialisatieLabel?.value,
        statusLabel: binding.statusLabel?.value,
        startdatum: formatDate(binding.startdatum?.value),
        einddatum: formatDate(binding.einddatum?.value)
      };
    });
    } catch (error) {
      console.error('Error querying API:', error);
      // Optionally, set apiResults to null or an empty array to clear previous results
      this.apiResults = null;
    }
  }


  @action
  handleSalaryChange(event) {
    const selectedValue = event.target.value;
    const manualInput = event.target.nextElementSibling;
    if (selectedValue === 'manual') {
      manualInput.style.display = 'block';
    } else {
      manualInput.style.display = 'none';
    }
  }

  @action
  handleManualInput(event) {
    const inputValue = event.target.value;
    // Handle the manual input value as needed
    console.log('Manual input value:', inputValue);
  }
}