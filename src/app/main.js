import { supabase } from '../services/supabaseClient.js'

// Función para listar usuarios
async function getUsers() {
    const { data, error } = await supabase.from('users').select('*')
    if (error) console.error(error)
    else console.log(data)
}

// Función para agregar usuario
async function addUser(name, email) {
    const { data, error } = await supabase
        .from('users')
        .insert([{ name, email }])
    if (error) console.error(error)
    else console.log('Usuario agregado:', data)
}

// Prueba agregando un usuario
addUser('Richard Zapata', 'richard@example.com')

// Listar todos los usuarios
getUsers()
