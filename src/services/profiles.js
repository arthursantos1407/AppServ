import { supabase } from "../lib/supabase";

export async function fetchProfiles(categoryFilter = null, searchTerm = "") {
  // Filtra apenas utilizadores com o role "professional"
  let query = supabase
    .from("profiles")
    .select("*")
    .eq("role", "professional");

  if (categoryFilter) {
    query = query.ilike("category", `%${categoryFilter}%`);
  }

  if (searchTerm) {
    query = query.or(
      `full_name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`,
    );
  }

  const { data, error } = await query;
  if (error) {
    console.error("Erro ao buscar perfis:", error);
    return [];
  }
  return data;
}

export async function createProfile(profileData) {
  const { data, error } = await supabase
    .from("profiles")
    .insert([profileData])
    .select();

  if (error) {
    console.error("Erro ao criar perfil:", error);
    throw error;
  }
  return data;
}

export async function createServiceRequest(
  professionalId,
  description,
  whenNeeded,
) {
  const { data, error } = await supabase
    .from("requests")
    .insert([
      {
        professional_id: professionalId,
        description: description,
        when_needed: whenNeeded,
      },
    ])
    .select();

  if (error) {
    console.error("Erro ao enviar solicitação:", error);
    throw error;
  }
  return data;
}

export async function updateProfile(profileId, updateData) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', profileId)
    .select();

  if (error) {
    console.error('Erro ao atualizar perfil:', error);
    throw error;
  }
  return data;
}