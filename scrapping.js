import fetch from "node-fetch";

const BASE_URL = "https://www.banrep.gov.co/series/api/series/TRM/datos";

async function getTRM(startDate, endDate) {
  const url = `${BASE_URL}?fechaInicial=${startDate}&fechaFinal=${endDate}&formato=json`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return data.map(item => ({
      date: item.fecha,
      value: parseFloat(item.valor)
    }));
  } catch (error) {
    console.error("Error fetching TRM:", error);
    throw error;
  }
}

// ejemplo
(async () => {
  const data = await getTRM("2024-06-01", "2024-06-30");
  console.log(data);
})();