import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import fetch from 'fetch';

export default class RekenhofController extends Controller {
  @service('current-session') currentSession;
  @tracked apiResults = null;
  @tracked salaryValues = ["option1", "option2", "option3", "option4", "option5", "manual"];
  @tracked salaryOutputs = ["Niet vergoed", "Tussen 1 en 5393 EUR", "Tussen 5340 en 11.880 EUR", "Tussen 11.881 en 59.399 EUR", "Tussen 59.400 en 118.798 EUR", "manual"];
  
  @tracked selectedValue = 'option1';
  
  constructor() {
    super(...arguments);
    this.queryApi(); // Call the queryApi function when the controller is instantiated
  }

  @action
  async queryApi() {
    let uri = this.currentSession.group.uri;
    try {
      let response = await fetch(`/rekenhof-api/bestuurseenheid-data?bestuurseenheid=${uri}`);
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

      // Initialize salaryValues with default values
      this.salaryValues = this.apiResults.map(() => ({
        selectedValue: 'option1',
        manualInput: ''
      }));
    } catch (error) {
      console.error('Error querying API:', error);
      // Optionally, set apiResults to null or an empty array to clear previous results
      this.apiResults = null;
    }
  }

  @action
  handleSalaryChange(event, context, index) {
    if (index < 0 || index >= this.salaryValues.length) {
      console.error('Index out of bounds:', index);
      return;
    }

    const selectedValue = event.target.value;
    this.salaryValues[index].selectedValue = selectedValue; // Update the selected value in the salaryValues array
    const manualInput = document.querySelector(`.manual-input[data-index="${index}"]`);
  
    if (selectedValue === 'manual') {
      if (manualInput) {
        manualInput.style.display = 'block';
      }
    } else {
      if (manualInput) {
        manualInput.style.display = 'none';
      }
    }
  }
  
  @action
  handleManualInput(controller, index, inputValue) {
    if (index < 0 || index >= controller.salaryValues.length) {
      console.error('Index out of bounds:', index);
      return;
    }

    controller.salaryValues[index].manualInput = inputValue;
  }

  @action
  exportToCSV() {
    const rows = [
      ["Voornaam", "Achternaam", "Geboortedatum", "Geslacht", "RRN", "Bestuurseenheid", "Status Label", "Startdatum", "Einddatum", "Vork bruto jaarsalaris na aftrek sociale bijdragen"],
      ...this.apiResults.map((result, index) => {
        const { selectedValue, manualInput } = this.salaryValues[index];
        const salaryOutput = selectedValue === 'manual' ? manualInput : this.salaryOutputs[this.salaryValues.findIndex(value => value === selectedValue)];
        return [
          result.voornaam,
          result.achternaam,
          result.geboortedatum,
          result.geslacht,
          result.rrn,
          result.bestuursorgaanTijdsspecialisatieLabel,
          result.statusLabel,
          result.startdatum,
          result.einddatum,
          salaryOutput
        ];
      })
    ];

    let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "rekenhof_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}