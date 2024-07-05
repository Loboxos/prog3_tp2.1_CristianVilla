class Currency {
    constructor(code, name) {
        this.code = code;
        this.name = name;
    }
}

class CurrencyConverter {
    constructor(apiUrl,currencies) {
        this.apiUrl = apiUrl;
        this.currencies = [];
    }

    async getCurrencies() {
        try {
            const response = await fetch(`${this.apiUrl}/currencies`);
            if (!response.ok){
                throw new Error('Error al obtener las monedas: '+response.status);
            }
            const data = await response.json();
            for (const code in data){
                const name= data[code];
                const currency = new Currency(code,name);
                this.currencies.push(currency);
            }
            }catch(error){
                console.error('error al obtener las monedas: ',error)
        }
        
    }

    async convertCurrency(amount, fromCurrency, toCurrency) {
        if(fromCurrency.code === toCurrency.code){
            return amount;
        }
        try {
            const response = await fetch(`${this.apiUrl}/latest?amount=${amount}&from=${fromCurrency.code}&to=${toCurrency.code}`);
            if (!response.ok){
                throw new Error('Error al convertir la moneda: '+ response.status);
        }
        const data=await response.json();
        return data.rates[toCurrency.code];
        }catch(error){
            console.error('Error al convertir la moneda: ', error);
            return null;
        }
    }
    async getExchangeRateDifference(fromCurrency, toCurrency) {
        try {
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            console.log(today);
            console.log(yesterday);
            const todayResponse = await fetch(`${this.apiUrl}/${today}?from=${fromCurrency.code}&to=${toCurrency.code}`);
            const yesterdayResponse = await fetch(`${this.apiUrl}/${yesterday}?from=${fromCurrency.code}&to=${toCurrency.code}`);

            if (!todayResponse.ok || !yesterdayResponse.ok) {
                throw new Error('Error al obtener las tasas de cambio.');
            }

            const todayData = await todayResponse.json();
            const yesterdayData = await yesterdayResponse.json();

            const todayRate = todayData.rates[toCurrency.code];
            const yesterdayRate = yesterdayData.rates[toCurrency.code];

            return todayRate - yesterdayRate;
        } catch (error) {
            console.error('Error al obtener la diferencia de tasas de cambio:', error);
            return null;
        }
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("conversion-form");
    const resultDiv = document.getElementById("result");
    const fromCurrencySelect = document.getElementById("from-currency");
    const toCurrencySelect = document.getElementById("to-currency");
    const differenceBtn = document.getElementById("difference-btn");
    const differenceDiv = document.getElementById("difference");
    const converter = new CurrencyConverter("https://api.frankfurter.app");

    await converter.getCurrencies();
    populateCurrencies(fromCurrencySelect, converter.currencies);
    populateCurrencies(toCurrencySelect, converter.currencies);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const amount = document.getElementById("amount").value;
        const fromCurrency = converter.currencies.find(
            (currency) => currency.code === fromCurrencySelect.value
        );
        const toCurrency = converter.currencies.find(
            (currency) => currency.code === toCurrencySelect.value
        );

        const convertedAmount = await converter.convertCurrency(
            amount,
            fromCurrency,
            toCurrency
        );

        if (convertedAmount !== null && !isNaN(convertedAmount)) {
            resultDiv.textContent = `${amount} ${
                fromCurrency.code
            } son ${convertedAmount.toFixed(2)} ${toCurrency.code}`;
        } else {
            resultDiv.textContent = "Error al realizar la conversión.";
        }
    });

    differenceBtn.addEventListener("click", async () => {
        const fromCurrency = converter.currencies.find(
            (currency) => currency.code === fromCurrencySelect.value
        );
        const toCurrency = converter.currencies.find(
            (currency) => currency.code === toCurrencySelect.value
        );

        const difference = await converter.getExchangeRateDifference(fromCurrency, toCurrency);

        if (difference !== null && !isNaN(difference)) {
            differenceDiv.textContent = `La diferencia en la tasa de cambio entre hoy y ayer es: ${difference.toFixed(4)}`;
        } else {
            differenceDiv.textContent = "Error al obtener la diferencia de tasa de cambio.";
        }
    });

    function populateCurrencies(selectElement, currencies) {
        if (currencies) {
            currencies.forEach((currency) => {
                const option = document.createElement("option");
                option.value = currency.code;
                option.textContent = `${currency.code} - ${currency.name}`;
                selectElement.appendChild(option);
            });
        }
    }
});
