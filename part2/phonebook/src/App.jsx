import { useState, useEffect } from "react";
import Filter from "./components/Filter";
import PersonForm from "./components/PersonForm";
import Persons from "./components/Persons";
import personServices from "./services/persons";
import Notification from "./components/Notification";

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [filter, setFilter] = useState("");
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    personServices.getAll().then((initial) => {
      setPersons(initial);
    });
  }, []);

  const handleNewName = (event) => setNewName(event.target.value);
  const handleNewNumber = (event) => setNewNumber(event.target.value);
  const handleFilter = (event) => setFilter(event.target.value);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const addPerson = (event) => {
    event.preventDefault();

    const nameExists = persons.find(
      (person) => person.name.toLowerCase() === newName.trim().toLowerCase(),
    );

    if (nameExists) {
      const confirmUpdate = window.confirm(
        `${nameExists.name} is already added to phonebook, replace the old number with a new one?`,
      );

      if (confirmUpdate) {
        const updatePerson = { ...nameExists, number: newNumber.trim() };

        personServices
          .update(nameExists.id, updatePerson)
          .then((changedNum) => {
            setPersons(
              persons.map((p) => (p.id !== nameExists.id ? p : changedNum)),
            );
            setNewName("");
            setNewNumber("");
            showNotification(`Updated ${changedNum.name}'s number`);
          })
          .catch((error) => {
            if (
              error.response &&
              error.response.data &&
              error.response.data.error
            ) {
              showNotification(error.response.data.error, "error");
            } else {
              showNotification(
                `Information of '${nameExists.name}' has already been removed from server`,
                "error",
              );
              setPersons(persons.filter((p) => p.id !== nameExists.id));
            }
          });
      }
      return;
    }

    const personObject = {
      name: newName.trim(),
      number: newNumber.trim(),
    };

    personServices
      .create(personObject)
      .then((newPerson) => {
        setPersons(persons.concat(newPerson));
        setNewName("");
        setNewNumber("");
        showNotification(`Added ${newPerson.name}`);
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.error || "Failed to add person";
        showNotification(errorMessage, "error");
      });
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete ${name} ?`)) {
      personServices
        .remove(id)
        .then(() => {
          setPersons(persons.filter((person) => person.id !== id));
        })
        .catch(() => {
          showNotification(
            `Information of '${name}' has already been removed from server`,
            "error",
          );
          setPersons(persons.filter((person) => person.id !== id));
        });
    }
  };

  const personsToShow =
    filter === ""
      ? persons
      : persons.filter((person) =>
          person.name.toLowerCase().includes(filter.toLowerCase()),
        );

  return (
    <div>
      <h2>Phonebook</h2>

      <Notification notification={notification} />

      <Filter filter={filter} handleFilter={handleFilter} />

      <h3>Add a new</h3>

      <PersonForm
        addPerson={addPerson}
        newName={newName}
        handleNewName={handleNewName}
        newNumber={newNumber}
        handleNewNumber={handleNewNumber}
      />

      <h3>Numbers</h3>

      <Persons personsToShow={personsToShow} handleDelete={handleDelete} />
    </div>
  );
};

export default App;
