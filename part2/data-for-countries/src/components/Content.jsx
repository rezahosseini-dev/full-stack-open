import CountryDetail from "./CountryDetail";

const Content = ({ countries, handleShowCountry }) => {
  if (countries.length > 10) {
    return <p>Too many matches, specify another filter</p>;
  }

  if (countries.length > 1) {
    return (
      <div>
        {countries.map((country) => (
          <div key={country.cca3}>
            {country.name.common}{" "}
            <button onClick={() => handleShowCountry(country.name.common)}>
              show
            </button>
          </div>
        ))}
      </div>
    );
  }

  if (countries.length === 1) {
    return <CountryDetail country={countries[0]} />;
  }

  return null;
};

export default Content;
