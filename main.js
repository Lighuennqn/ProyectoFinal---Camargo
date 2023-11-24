
//////////Variables//////////

let posicion = 0;
let posicion2 = 20;
let pokeListaFull = [];
let listaTipoFull = [];
let tarjetas = ``;
let filtrosActivados = false;
let tipoActual = "";
let carritoVar = [];
let precioFinal = 0;
let tarjetasCarrito = "";

//////////DOM//////////

let contenedor = document.getElementById("contenedorTarjetas");
let contenedorBotonesTipo = document.getElementById("botonesTipo")
let botonTipo = document.querySelectorAll(".botonTipo")
let botonNext = document.querySelectorAll(".next");
let botonPrev = document.querySelectorAll(".prev");
let botonResetFiltro = document.getElementById("resetFiltros");
let contenedorCarrito = document.querySelector(".contenedorCarrito");
let precio = document.querySelector(".contenedorPrecio");
let botonVaciar = document.getElementById("vaciar");
let botonComprar = document.getElementById("comprar");

////////// MAIN //////////

creadorBotones();
listaApi();
renderCarrito();
sumar();

////////// eventos  //////////

botonVaciar.addEventListener("click", () => {
    localStorage.clear();
    contenedorCarrito.innerHTML = "";
    sumar();

});

botonComprar.addEventListener("click", () => {
    Swal.fire({
        title: 'Compra realizada con exito',
        text: 'sus pokemon serán trozados y llevados al domicilio correspondiente',
        icon: 'success',
        confirmButtonText: 'Aceptar'
    });
    console.log("console log que representa la acción que debería suceder al comprar");
    localStorage.clear();
    contenedorCarrito.innerHTML = "";
    sumar();
});

botonResetFiltro.addEventListener("click", () => {
    posicion = 0;
    filtrosActivados = false;
    pokeListaFull = [];
    listaApi();
});

botonNext.forEach((botonApretado) => {
    botonApretado.addEventListener("click", () => {
        if (filtrosActivados) {
            posicion2 += 20;
            listaTipoFull = [];
            filtro(tipoActual);
        }
        else {
            if (posicion >= 990) {
                console.log("tope maximo de pokemon");
            }
            else {
                posicion += 20;
                pokeListaFull = [];
                listaApi();
            }
        }

    });
});

botonPrev.forEach((botonApretado) => {
    botonApretado.addEventListener("click", () => {
        if (filtrosActivados && posicion2 == 20) {
            console.log("tope negativo en filtro");
        }
        else if (filtrosActivados) {
            posicion2 -= 20;
            listaTipoFull = [];
            filtro(tipoActual);
        }
        else {
            if (posicion == 0) {
                console.log("tope negativo");
            }
            else {
                posicion -= 20;
                pokeListaFull = [];
                listaApi();
            }
        }

    });
});

////////// funciones //////////

//~~~ funcion que pide la lista de pokemon a la api y llama a la funcion obtenedora de datos(armador de lista) ~~~//

async function listaApi() {
    try {
        let respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/?limit=20&offset=${posicion}`);
        let pokeLista = await respuesta.json();
        pokeLista = pokeLista.results;
        armadorDeLista(pokeLista, pokeListaFull);
    } catch {
        console.log('Error en lista api');
    }
};

//~~~ funcion que obtiene los datos de cada pokemon y los acumula en forma de objetos adentro de un array(y tambien envia al render ese array)~~~//

async function armadorDeLista(lista, listaFull) {
    try {
        if (lista) {
            for (const item of lista) {
                const pokeData = await fetch(item.url);
                const data = await pokeData.json();
                const nuevoPokemon = new pokemon(
                    data.id,
                    data.name,
                    data.types.map(type => type.type.name),
                    data.weight / 10,
                    data.height / 10,
                    data.sprites.front_default
                );
                listaFull.push(nuevoPokemon);
            }
        } else {
            console.log('La lista esta vacia o todavia no carga');
        }
        await renderPrincipal(listaFull);
    } catch {
        console.log('Error en armador de lista');
    }
};

//~~~ funcion que recibe una lista con objetos(pokemon) y los imprime en el html con sus botones(para agregar al carrito)~~~//

async function renderPrincipal(lista) {
    tarjetas = ``;
    try {
        lista.forEach(pokemon => {
            tarjetas += `
        <div class="pokeTarjeta">
            <h2>Id: ${pokemon.id}</h2>
            <h2>Nombre: ${pokemon.nombre}</h2>
            <img src="${pokemon.foto}" alt="sprite del Pokemon">
            <h3>Peso: ${pokemon.peso} Kg</h3>
            <h3>Altura: ${pokemon.altura} Metros</h3> 
            <ol>Tipos: ${pokemon.tipo.map(tipo => `<li>${tipo}</li>`).join(' ')}
            </ol>
            <button class="botonAgregar" data-id="${pokemon.id}">Agregar al carrito</button>
        </div>`;
        });
    } catch {
        console.log('Error en render principal');
    }
    contenedor.innerHTML = tarjetas;
    let botonAgregarPokemon = document.querySelectorAll(".botonAgregar");
    botonAgregarPokemon.forEach((botonApretado) => {
        botonApretado.addEventListener("click", () => {
            lista.forEach(pokemon => {
                if (pokemon.id == botonApretado.dataset.id) {
                    carritoVar = JSON.parse(localStorage.getItem("carritoLocalStorage")) || [];
                    console.log(pokemon);
                    carritoVar.push(pokemon);
                    localStorage.setItem("carritoLocalStorage", JSON.stringify(carritoVar));

                    Swal.fire({
                        title: 'Pokemon agregado al Pokecarrito',
                        icon: 'success',
                        confirmButtonText: 'Aceptar'
                    });

                    renderCarrito();
                }

            })
        })
    });
};

//~~~ funcion que imprime en el carrito y los botones de eliminar del carrito correspondiente a cada tarjeta ~~~//

async function renderCarrito() {
    try {
        tarjetasCarrito = "";
        let contador = 0;
        let carrito = JSON.parse(localStorage.getItem("carritoLocalStorage"));

        carrito.forEach(pokemon => {
            contador = contador + 1;
            tarjetasCarrito += `
            <div class="carritoTarjeta">
                <img src="${pokemon.foto}" alt="fotografia del susodicho">
                <h4>${pokemon.nombre}</h4>
                <h4>Peso:</h4>
                <p>${pokemon.peso} Kg</p>
                <h5>Precio: ${Math.round(pokemon.peso * 700)} $</h5>
                <button class="botonBorrar" data-index="${contador - 1}">Quitar del carrito</button>   
            </div>`

        })
    }
    catch {
        console.log("Error en el render del carrito");
    }
    contenedorCarrito.innerHTML = tarjetasCarrito;
    botonBorrar = document.querySelectorAll(".botonBorrar");
    botonBorrar.forEach((botonApretado) => {
        botonApretado.addEventListener("click", () => {
            carrito = JSON.parse(localStorage.getItem("carritoLocalStorage"));
            carrito.splice(botonApretado.dataset.index, 1);
            localStorage.setItem("carritoLocalStorage", JSON.stringify(carrito));
            renderCarrito();

        })
    })
    sumar();
};

//~~~ funcion que crea los botones de tipo y sus eventos, que a su vez llaman a la funcion filtro pokemon~~~//

async function creadorBotones() {
    try {
        let respuesta = await fetch(`https://pokeapi.co/api/v2/type`);
        let pokeListaTipos = await respuesta.json();
        pokeListaTipos = pokeListaTipos.results;

        pokeListaTipos.forEach((tipo) => {
            if (tipo.name == "shadow" || tipo.name == "unknown") {
            }
            else {
                const botonTipo = document.createElement('button');
                botonTipo.textContent = tipo.name;
                botonTipo.classList.add('botonTipo');
                contenedorBotonesTipo.appendChild(botonTipo);
            }
        });
        let botonTipo = document.querySelectorAll(".botonTipo");

        botonTipo.forEach((botonApretado) => {
            botonApretado.addEventListener("click", () => {
                filtrosActivados = true;
                posicion2 = 20;
                listaTipoFull = [];
                tipoActual = botonApretado.textContent;
                filtro(botonApretado.textContent);
            })
        });

    } catch {
        console.log("Error en creador de botones");
    }
};

//~~~ funcion que solicita a la api las listas de pokemon filtrados por tipo y las envia a armador de lista ~~~//

async function filtro(tipo) {
    let respuestaLista = await fetch(`https://pokeapi.co/api/v2/type/${tipo}`);
    let listaTipoUseless = await respuestaLista.json();
    listaTipoUseless = listaTipoUseless.pokemon;
    let listaTipo = [];
    for (let i = posicion2 - 20; i < posicion2; i++) {
        listaTipo.push(listaTipoUseless[i].pokemon);
    }
    armadorDeLista(listaTipo, listaTipoFull);
};

//~~~Funcion que imprime el precio final de los pokemon agregados al carrito ~~~//

function sumar() {
    let pokemonEnCarrito = JSON.parse(localStorage.getItem("carritoLocalStorage"));
    precioFinal = 0;
    if (pokemonEnCarrito) {
        pokemonEnCarrito.forEach(pokemon => {

            precioFinal = precioFinal + pokemon.peso * 700;

        });
    } else {
        console.log("carrito vacio");
    }
    precio.innerHTML = `<h2> ${Math.round(precioFinal)} $$$ </h2>`;
};

//////////Constructor de objetos/pokemon//////////

class pokemon {
    constructor(id, nombre, tipo, peso, altura, foto) {
        this.id = id;
        this.nombre = nombre;
        this.tipo = tipo;
        this.peso = peso;
        this.altura = altura;
        this.foto = foto;
    }
};