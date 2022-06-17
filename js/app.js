let db = null;
let objectStore = null;

let $ = document;
const registerForm = $.querySelector(".register-form");
const nameInput = $.querySelector(".name-input");
const emailInput = $.querySelector(".email-input");
const passwordInput = $.querySelector(".password-input");

const tableElem = $.querySelector("table");

window.addEventListener("load", () => {
  let dbOpenReq = indexedDB.open("BananaCode", 16);

  dbOpenReq.addEventListener("error", (err) => {
    console.warn(err);
  });
  dbOpenReq.addEventListener("success", (event) => {
    db = event.target.result;
    getUsers();
    console.log("success : ", event.target.result);
  });

  dbOpenReq.addEventListener("upgradeneeded", (event) => {
    db = event.target.result;

    console.log("old-v", event.oldVersion);
    console.log("new-v", event.newVersion);

    if (!db.objectStoreNames.contains("users")) {
      objectStore = db.createObjectStore("users", {
        keyPath: "id",
      });
    }

    if (db.objectStoreNames.contains("courses")) {
      db.deleteObjectStore("courses");
    }

    // db.createObjectStore("courses");

    console.log("upgrade", db.objectStoreNames);
  });
});

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  let newUser = {
    id: Math.floor(Math.random() * 9999),
    name: nameInput.value,
    email: emailInput.value,
    password: passwordInput.value,
  };
  let tx = createTx("users", "readwrite");

  tx.addEventListener("complete", (event) => {
    console.log("tx : ", event);
  });

  let store = tx.objectStore("users");
  let request = store.add(newUser);

  request.addEventListener("error", (err) => {
    console.warn("request error : ", err);
  });
  request.addEventListener("success", (event) => {
    console.log("request", event);

    clearInput();
    getUsers();
  });
});

function clearInput() {
  nameInput.value = "";
  emailInput.value = "";
  passwordInput.value = "";
}

function getUsers() {
  let tx = createTx("users", "readonly");
  tx.addEventListener("complete", (event) => {
    console.log("tx : ", event);
  });

  let store = tx.objectStore("users");
  let request = store.getAll();

  request.addEventListener("error", (err) => {
    console.warn("Get request error : ", err);
  });
  request.addEventListener("success", (event) => {
    console.log("Get request :", event);

    let allUsers = event.target.result;

    tableElem.innerHTML = `
    <tr>
       <th>ID</th>
       <th>Name</th>
      <th>Email</th>
      <th>Password</th>
      <th>Actions</th>
    </tr>`;

    tableElem.innerHTML += allUsers
      .map((user) => {
        return `
    <tr>
      <td>${user.id}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.password}</td>
      <td><a href="#" onclick="removeUser(${user.id})">Remove</td>
    </tr>`;
      })
      .join("");

    console.log(tableElem);
  });
}

function removeUser(id) {
  event.preventDefault();
  let tx = createTx("users", "readwrite");

  tx.addEventListener("complete", (event) => {
    console.log("Delete tx : ", event);
  });
  let store = tx.objectStore("users");
  let request = store.delete(id);

  request.addEventListener("error", (err) => {
    console.warn("Delete request error : ", err);
  });
  request.addEventListener("success", (event) => {
    console.log("Delete request", event);

    getUsers();
  });
}

function createTx(storeName, mode) {
  let tx = db.transaction(storeName, mode);

  tx.addEventListener("error", (err) => {
    console.warn("tx error : ", err);
  });
  return tx;
}
