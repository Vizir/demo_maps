jQuery(document).ready(function() {

  function addLocationsToMap(json){
    geocoder = new google.maps.Geocoder();
    var myOptions = {
      zoom: map_zoom,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    var marker = new Array;

    geocoderInit = new google.maps.Geocoder();
        geocoderInit.geocode( { 'address': selectPaisSend}, function(results, status) {
          map.setCenter(results[0].geometry.location);
    });

    ipfCount = json.ipf.length
    for( i=0; i<ipfCount; i++){
      var location = new google.maps.LatLng(json.ipf[i].latitude, json.ipf[i].longitude);
      markerInit = marker[i]  
      marker[i] = new google.maps.Marker({
          position: location, 
          map: map,
          //icon: 'mapn.png'Ico
      });

      var addListener = function (i) {
        google.maps.event.addListener(marker[i], 'click', function(){
          jQuery('#preInfo').fadeOut(200); 
          setTimeout(showInfo(json.ipf[i]), 200)      
        });
      }
      addListener(i)
    }
  }

  function populateMap(json){
    var brasil = new google.maps.LatLng(20.689060, 20.044636);
    var myOptions = {
      zoom: 2,
      center: brasil,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    var marker = new Array;
    var ipfCount = json.ipf.length;

    for( i=0; i<ipfCount; i++){
      var location = new google.maps.LatLng(json.ipf[i].latitude, json.ipf[i].longitude);
      marker[i] = new google.maps.Marker({
        position: location, 
        map: map
      });

      var addListener = function(i) {
        google.maps.event.addListener(marker[i], 'click', function(){
            jQuery('#preInfo').fadeOut(200); 
            setTimeout(showInfo(json.ipf[i]), 200)      
          });
        }
        addListener(i)
    }

    setTimeout(showInfo(json.ipf[0]), 200);
    var categoriaCount = json.categorias.length;

    for(var i=0; i<categoriaCount; i++){
      listagemCategorias = json.categorias[i].categoria;
      selectCategoria = jQuery('#categorias') 
      selectCategoria.append("<option id='local"+i+"' value='"+listagemCategorias+"'>"+listagemCategorias+"</option>");
    }

    paisCount = json.pais.length;

    for(var i=0; i<paisCount; i++){
      listagemPaises = json.pais[i].pais;
      selectPais =jQuery('#pais');
      selectPais.append("<option class='"+listagemPaises+"'>"+listagemPaises+"</option>");
    }
  
  }

  function call(addMarkers, url){
    jQuery.ajax({
      url: url,
      dataType: 'jsonp',
      crossDomain: true,
      jsonp: false,
      jsonpCallback: 'JSONP',
      success: addMarkers
    });
  }

  function initializeMap() {
    call(populateMap, 'http://localhost:9393/resources.json');
  }
    

  function getInfo(info, title){  
    if(info){
      return "<h3>"+ title + "</h3>" + "<p class='innerInfo'>"+ info +"</p>"
    }
    else{
      return ""
    }
  }

  function showInfo(arrayPointer){  
    close = "<a class='mamodalModalClose' href='#''>X</a>"
    nome = "<h3 style='margin-left:10px; font-weight: bold; color: #444; font-size: 16px; padding: 8px 0px 0px 0px; margin: 5px 0px 18px 14px;'>"+arrayPointer.nome+"</h3>"
    categoria = getInfo(arrayPointer.categoria, "Categoria")
    pais = getInfo(arrayPointer.pais, "País")
    estado = getInfo(arrayPointer.estado, "Estado/Cidade")
    endereco = getInfo(arrayPointer.endereco, "Endereço")
    telefone = getInfo(arrayPointer.telefone, "Telefone")
    responsavel = getInfo(arrayPointer.responsavel, "Responsável")

    descricao = "<p style='border-bottom:none; margin-bottom:15px;' class='innerInfo'>"+arrayPointer.descricao+"</p>"
    fundacao = getInfo(arrayPointer.fundacao, "Fundação")
    site = getInfo(arrayPointer.site, "Site")
    emails = getInfo(arrayPointer.emails, "Email")

    jQuery('#info div').html(categoria+pais+estado+endereco+telefone+emails+site+responsavel+fundacao); 
    jQuery('.mamodalModal').html(close+nome+descricao)
    jQuery('#right h1').html(arrayPointer.nome);
    jQuery('.innerInfo').fadeIn(200);

    jQuery(".mamodalModalClose").click(function(){
      jQuery(".mamodalModal").fadeOut();
      jQuery(".mamodalBackground").fadeOut();
    })

    jQuery(".mamodalBackground").click(function(){
      jQuery(".mamodalModal").fadeOut();
      jQuery(".mamodalBackground").fadeOut();
    })

    jQuery(".maisInfo").click(function(){
      jQuery(".mamodalModal").fadeIn();
      jQuery(".mamodalBackground").fadeIn();
      return false
    })


  }     

  function filter(){
    selectCategorias =jQuery('#categorias').val();
    selectPais = jQuery('#pais').val();
    selectPaisSend = jQuery("#pais").find("option:selected").attr("class");
    selectCategorias =jQuery('#categorias').val();
    selectPais = jQuery('#pais').val();
    selectPaisSend = jQuery("#pais").find("option:selected").attr("class");

    if(selectPais == ""  && selectCategorias == ""){
      return false
    }

    if(selectPaisSend != "all" && selectCategorias == "all"){
      var latlngStr = selectPais.split(',', 2);
      var lat = parseFloat(latlngStr[0]);
      var lng = parseFloat(latlngStr[1]);
      var newCenter = new google.maps.LatLng(lat, lng);
      map.setCenter(newCenter);
      showResults("http://localhost:9393/resources/"+selectPaisSend+"/"+selectCategorias+".json", 4)
      return false
    } else if (selectPaisSend != "all" && selectCategorias != "all"){
      var latlngStr = selectPais.split(',', 2);
      var lat = parseFloat(latlngStr[0]);
      var lng = parseFloat(latlngStr[1]);
      var newCenter = new google.maps.LatLng(lat, lng);
      map.setCenter(newCenter);
      showResults("http://localhost:9393/resources/"+selectPaisSend+"/"+selectCategorias+".json", 4)
    } else if (selectPaisSend == "all" && selectCategorias != "all"){
      var latlngStr = selectPais.split(',', 2);
      var lat = parseFloat(latlngStr[0]);
      var lng = parseFloat(latlngStr[1]);
      var newCenter = new google.maps.LatLng(20.689060, 20.044636);
      map.setCenter(newCenter);
      showResults("http://localhost:9393/resources/"+selectPaisSend+"/"+selectCategorias+".json", 2)
      return false
    } else if (selectPaisSend == "all" && selectCategorias == "all"){
      var latlngStr = selectPais.split(',', 2);
      var lat = parseFloat(latlngStr[0]);
      var lng = parseFloat(latlngStr[1]);
      var newCenter = new google.maps.LatLng(20.689060, 20.044636);
      map.setCenter(newCenter);
      showResults("http://localhost:9393/resources/"+selectPaisSend+"/"+selectCategorias+".json", 2)
    }
    return false
  }

  function showResults(url, zoom){
    map_zoom = zoom;
    call(addLocationsToMap, url);

  }

  jQuery('#submit').click(function(){
    filter();
    return false;
  })

  initializeMap();
});