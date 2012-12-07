require "sinatra"
require "json"
require "faker"
require "geocoder"
require "dm-core"
require "dm-migrations"
require "dm-sqlite-adapter"

configure do
  DataMapper::setup(:default, "sqlite3://#{Dir.pwd}/db/resources.db")
  BRAZIL_STATES = ["Rio Grande do Sul", "Sao Paulo", "Rio de Janeiro", "Bahia", "Mato Grosso"]
  

  class Resource
    include DataMapper::Resource
    
    property :id, Serial
    property :nome, String
    property :categoria, String
    property :pais, String
    property :estado, String
    property :endereco, Text
    property :telefone, String
    property :responsavel, String
    property :fundacao, String
    property :latitude, String
    property :longitude, String
    property :descricao, Text
    property :site, String
    property :emails, Text
    property :created_at, DateTime
    property :updated_at, DateTime

    def self.to_json(conditions = {})
      attributes_to_json = [:nome, :categoria, :pais, :estado, :endereco, 
        :telefone, :responsavel, :fundacao, :latitude, 
        :longitude, :descricao, :site, :emails]
      result = []
      
      self.all(:fields => attributes_to_json, :conditions => conditions).each do |resource|
        result << resource.attributes
      end
      result
    end
  end
  
  DataMapper.auto_migrate!

  def create_resources
    resources = []
    categories = ['ONG', 'Centro de Pesquisa']
    ["Brasil", "EUA"].each do |country|
      5.times do |i|
        if country == "Brasil"
          state = BRAZIL_STATES[i]
        else
          state = Faker::Address.state
        end
        result = Geocoder.search(state).first
        geocode = result.data["geometry"]["location"]
        latitude = geocode["lat"]
        longitude = geocode["lng"]
        Resource.create(
          :nome => Faker::Company.name,
          :categoria => categories[(i.even?)? 0 : 1],
          :pais => country,
          :estado => state,
          :endereco => Faker::Address.street_name,
          :telefone => Faker::PhoneNumber.phone_number,
          :responsavel => Faker::Name.name,
          :fundacao => "01/01/200#{i}",
          :latitude => latitude,
          :longitude => longitude,
          :descricao => Faker::Lorem.paragraph,
          :site => Faker::Internet.url,
          :emails => Faker::Internet.email
        )
      end
    end
  end

  if Resource.count == 0
    create_resources
  end
end

get '/resources.json' do
  content_type :json

  resources = Resource.to_json
  countries = [{:pais => 'EUA'}, {:pais => 'Brasil'}]
  categories = [{:categoria => 'ONG'}]
  "JSONP(#{{:ipf => resources, :pais => countries, :categorias => categories}.to_json})"
end

get '/resources/:country/:category.json' do
  content_type :json
  categoria_condition = (params["category"] == "all")? {} : {:categoria => params["category"]}
  country_condition = (params["country"] == "all")? {} : {:pais => params["country"]}
  resources = Resource.to_json(categoria_condition.merge(country_condition))
  "JSONP(#{{:ipf => resources}.to_json})"
end
