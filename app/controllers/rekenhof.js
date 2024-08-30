import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action, set } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import fetch from 'fetch';

export default class RekenhofController extends Controller {
  @service('current-session') currentSession;
  @tracked apiResults = null;
  @tracked filterAangifteplichtig = false;

  salaryOptions = [
    { label: 'Niet vergoed', value: 'option1' },
    { label: 'Tussen 1 en 5393 EUR', value: 'option2' },
    { label: 'Tussen 5340 en 11.880 EUR', value: 'option3' },
    { label: 'Tussen 11.881 en 59.399 EUR', value: 'option4' },
    { label: 'Tussen 59.400 en 118.798 EUR', value: 'option5' },
    { label: 'Manuele ingave (wordt afgerond op het dichtste honderdduizendtal)', value: 'manual' }
  ];

  constructor() {
    super(...arguments);
    this.queryApi(); // Call the queryApi function when the controller is instantiated (when the page is loaded)
  }

  @action
  handleSalaryChange(selected, result) {
    // Using set to force reactiveness, otherwise the changes won't be reflected in the UI, not sure why since apiResults is @tracked
    set(selected, 'selectedSalary', result);
  }

  @action
  updateManualInput(selected, event) {
    selected.manualInputValue = event.target.value;
  }




  // Queries rekenhof api for relevant data based on logged in bestuurseenheid
  @action
  async queryApi() {
    let uri = this.currentSession.group.uri;
    try {
      let response = await fetch(`/rekenhof-api/bestuurseenheid-data?bestuurseenheid=${uri}&filterAangifteplichtig=${this.filterAangifteplichtig}`);
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
          rol: binding.rolLabel?.value,
          statusLabel: binding.statusLabel?.value,
          startdatum: formatDate(binding.startdatum?.value),
          einddatum: formatDate(binding.einddatum?.value),
        };
      });
    } catch (error) {
      console.error('Error querying API:', error);
      this.apiResults = null;
    }
  }

  @action
  toggleFilterAangifteplichtig(newCheckedValue) {
    this.filterAangifteplichtig = newCheckedValue;
    this.queryApi(); // Resend the API call when the toggle is changed
  }

  @action
  exportToCSV() {
    console.log('Exporting to CSV');

    if (!this.apiResults) {
      console.error('apiResults is null or undefined');
      return;
    }

    
    const rows = [
      ["Voornaam", "Achternaam", "Geboortedatum", "Geslacht", "RRN", "Bestuursorgaan", "Status Label", "Startdatum", "Einddatum", "Vork bruto jaarsalaris na aftrek sociale bijdragen"],
      ...this.apiResults.map((result, index) => {
        const salaryOutput = result.selectedSalary
      ? (result.selectedSalary.value === 'manual'
        ? Math.round(result.manualInputValue / 100000) * 100000 // Round to the nearest hundred thousand
        : result.selectedSalary.label)
      : '';
        return [
          result.voornaam,
          result.achternaam,
          result.geboortedatum,
          result.geslacht,
          result.rrn,
          result.bestuursorgaanTijdsspecialisatieLabel,
//          result.rol,
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