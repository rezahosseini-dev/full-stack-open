import Weather from "./Weather";

const CountryDetail = ({ country }) => {
  const languages = Object.values(country.languages || {});

  return (
    <div>
      <h2>{country.name.common}</h2>
      <p>capital {country.capital ? country.capital.join(", ") : "N/A"}</p>
      <p>area {country.area}</p>

      <h3>languages:</h3>
      <ul>
        {languages.map((lang) => (
          <li key={lang}>{lang}</li>
        ))}
      </ul>

      <img
        src={country.flags.png}
        alt={`Flag of ${country.name.common}`}
        width="150"
      />
      {country.capital && country.capital.length > 0 && (
        <Weather
          capital={country.capital}
          latlng={country.capitalInfo?.latlng}
        />
      )}
    </div>
  );
};

export default CountryDetail;
