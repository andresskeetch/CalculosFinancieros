var app = angular.module("CalculosFinancieros", ['ngResource', 'ngRoute']);

app.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider
            .when("/", {
                controller: 'mainController',
                templateUrl: "view/home/home.html"
            })
            .when('/:modulo/:url', {
                template: '<div ng-include="templateUrl">Loading...</div>',
                controller: 'mainController'
            })
            .otherwise("/");
    }
]);


app.controller("appController", function($scope){
})
app.controller("mainController",['$scope','$routeParams', function($scope,$routeParams){
    if ($routeParams.url == undefined) {
   
    }
    else {
        console.log($routeParams);
        $scope.templateUrl = 'view/' + $routeParams.modulo + '/' + $routeParams.url + '.html';
    }
}])

app.controller("pagosController", function($scope){
    $scope.data=[];
    $scope.respuesta=[];
    $scope.respuesta.banderaError=false;
    $scope.respuesta.mensajeError="";
    $scope.respuesta.banderaSuccess=false;
    $scope.respuesta.mensajeSuccess="";
    $scope.variablesUso=[];
    $scope.variablesUso.pagosExtraordinarios=[];
    $scope.resultados=[];
    $scope.data.tipoFuturo='EFECTIVO';
    $scope.agregarPago=function(){
        $scope.variablesUso.pagosExtraordinarios.push({
            periodo:0,
            valor:0,
            tipo:''
        })
    }
    $scope.Nueva=function(){
        $scope.respuesta=[];
        $scope.respuesta.banderaError=false;
        $scope.respuesta.mensajeError="";
        $scope.respuesta.banderaSuccess=false;
        $scope.respuesta.mensajeSuccess="";
        $scope.variablesUso=[];
        $scope.data=[];
        $scope.data.tipoFuturo='EFECTIVO';
    }
    $scope.Calcular=function()
    {
        /*if($scope.validarDatosIngreso())
        {*/
        $scope.respuesta.banderaError=false;
        $scope.respuesta.banderaSuccess=false;
        $scope.calcularMesesTasa();
        switch($scope.data.tipoPresente)
        {
            case "NOMINAL": $scope.convercionNominalEfectiva();break;
            case "EFECTIVO":$scope.variablesUso.porcentajeEfectivo=($scope.data.porcentaje/100); break;
        }
        $scope.equivalenciaTiemposTasa();
        switch($scope.data.tipoFuturo)
        {
            case "NOMINAL": $scope.variablesUso.Resultado=$scope.convercionEfectivaNominal();break;
            case "EFECTIVO":$scope.variablesUso.Resultado=$scope.variablesUso.TasaEfectivaInicial; break;
        }
        $scope.conversionTiempo();
        $scope.variablesUso.denominador=(1-1/(Math.pow(1+$scope.variablesUso.Resultado,$scope.variablesUso.tiempoTotal)))/$scope.variablesUso.Resultado;
        $scope.variablesUso.Cuota=$scope.data.capital/$scope.variablesUso.denominador;
        $scope.respuesta.banderaError=false;
        $scope.respuesta.banderaSuccess=true;
        $scope.respuesta.mensajeSuccess="Datos Calculados";
        $scope.respuesta.mensajeError="";
        $scope.calcularPagos();
    }
    $scope.calcularPagos=function(){
        $scope.resultados=[];
        $scope.resultados.push({
            cuota:$scope.variablesUso.Cuota,
            mensaje:'Cuota sin alteraciones',
            coutaFinal:$scope.variablesUso.tiempoTotal,
            coutaInicial:1,
            totalPagar:$scope.variablesUso.Cuota*$scope.variablesUso.tiempoTotal
        });
        var pagosExtraTemp=[];
        angular.copy($scope.variablesUso.pagosExtraordinarios,pagosExtraTemp);
        pagosExtraTemp=pagosExtraTemp.sort(function(a,b){return a.tiempo-b.tiempo});
        for (let index = 0; index < pagosExtraTemp.length; index++) {
            var ultimoPago=$scope.resultados[$scope.resultados.length-1];
            if(pagosExtraTemp[index].disminuye=="CUOTA"){
                $scope.resultados.push($scope.bajarCuota(ultimoPago,pagosExtraTemp[index]))
            }else{
                $scope.resultados.push($scope.bajarTiempo(ultimoPago,pagosExtraTemp[index]))
            }
        }
    }
    $scope.bajarCuota=function(ultimoPago,pagoExtraOrdinario){
        var cuotaAnterior=pagoExtraOrdinario.tiempo-1;
        var totalPeriodosPendientes=ultimoPago.coutaFinal-cuotaAnterior;
        var valorPresente=ultimoPago.cuota*((1- (1/Math.pow(1+$scope.variablesUso.Resultado,totalPeriodosPendientes)))/$scope.variablesUso.Resultado);
        var interesActual=valorPresente*$scope.variablesUso.Resultado;
        if(pagoExtraOrdinario.incluye=="NO"){
            pagoExtraOrdinario.pago+=$scope.variablesUso.Cuota
        }
        var valorPagoNeto=pagoExtraOrdinario.pago-interesActual;
        valorPresente-=valorPagoNeto;
        var denominadorEcuacion=(1-1/(Math.pow(1+$scope.variablesUso.Resultado,totalPeriodosPendientes+1)))/$scope.variablesUso.Resultado;
        var nuevaCuota=valorPresente/denominadorEcuacion;
        return {
            pagoExtraOrdinario:pagoExtraOrdinario,
            cuota:nuevaCuota,
            mensaje:'Pago ExtraOrdinario Reduccion de Cuota',
            coutaFinal:ultimoPago.coutaFinal,
            coutaInicial:pagoExtraOrdinario.tiempo,
            totalPagar:valorPresente
        };
    }
    $scope.bajarTiempo=function(ultimoPago,pagoExtraOrdinario){
        var cuotaAnterior=pagoExtraOrdinario.tiempo-1;
        var totalPeriodosPendientes=ultimoPago.coutaFinal-cuotaAnterior;
        var valorPresente=ultimoPago.cuota*((1- (1/Math.pow(1+$scope.variablesUso.Resultado,totalPeriodosPendientes)))/$scope.variablesUso.Resultado)
        var interesActual=valorPresente*$scope.variablesUso.Resultado;
        if(pagoExtraOrdinario.incluye=="NO"){
            pagoExtraOrdinario.pago+=$scope.variablesUso.Cuota
        }
        var valorPagoNeto=pagoExtraOrdinario.pago-interesActual;
        valorPresente-=valorPagoNeto;
        var valorEcuacion1=Math.log((((valorPresente/ultimoPago.cuota)*($scope.variablesUso.Resultado))-1)*-1);
        var valorEcuacion2=Math.log(1+$scope.variablesUso.Resultado);
        var TotalTiempoRestante=-1*(valorEcuacion1/valorEcuacion2);
        return {
            pagoExtraOrdinario:pagoExtraOrdinario,
            cuota:ultimoPago.cuota,
            mensaje:'Pago ExtraOrdinario Reduccion de Tiempo',
            coutaFinal:TotalTiempoRestante+cuotaAnterior+1,
            coutaInicial:pagoExtraOrdinario.tiempo,
            totalPagar:valorPresente
        }
    }
    $scope.conversionTiempo=function(){
        //$scope.variablesUso.tiempoTotal=$scope.variablesUso.cantidadTipoPagoFuturo*$scope.data.tiempo;
        $scope.variablesUso.tiempoTotal=$scope.data.tiempo;
    }
    $scope.convercionEfectivaNominal=function(){
        return $scope.variablesUso.TasaEfectivaInicial*$scope.variablesUso.cantidadTipoPagoFuturo;
    }
    $scope.equivalenciaTiemposTasa=function(){
        switch($scope.data.formaPagoFuturo)
        {
            case "MENSUAL": $scope.variablesUso.cantidadTipoPagoFuturo=12;break;
            case "TRIMESTRAL": $scope.variablesUso.cantidadTipoPagoFuturo=4;break;
            case "SEMESTRAL": $scope.variablesUso.cantidadTipoPagoFuturo=2;break;
            case "ANUAL": $scope.variablesUso.cantidadTipoPagoFuturo=1;break;
        }
        $scope.variablesUso.TasaEfectivaInicial=Math.pow($scope.variablesUso.porcentajeEfectivo+1,$scope.variablesUso.cantidadTipoPagoPresente);
        $scope.variablesUso.TasaEfectivaInicial=Math.pow($scope.variablesUso.TasaEfectivaInicial,1/$scope.variablesUso.cantidadTipoPagoFuturo)-1;
    }
    $scope.calcularMesesTasa=function(){
        switch($scope.data.formPagoPresente)
        {
            case "MENSUAL": $scope.variablesUso.cantidadTipoPagoPresente=12;break;
            case "TRIMESTRAL": $scope.variablesUso.cantidadTipoPagoPresente=4;break;
            case "SEMESTRAL": $scope.variablesUso.cantidadTipoPagoPresente=2;break;
            case "ANUAL": $scope.variablesUso.cantidadTipoPagoPresente=1;break;
        }
    }
    $scope.convercionNominalEfectiva=function(){
        $scope.variablesUso.porcentajeEfectivo=($scope.data.porcentaje/100)/$scope.variablesUso.cantidadTipoPagoPresente;
    }
})
app.controller("conversionController", function($scope) {
    $scope.data=[];
    $scope.respuesta=[];
    $scope.respuesta.banderaError=false;
    $scope.respuesta.mensajeError="";
    $scope.respuesta.banderaSuccess=false;
    $scope.respuesta.mensajeSuccess="";
    $scope.variablesUso=[];
    $scope.Calcular=function()
    {
        if($scope.validarDatosIngreso())
        {
            $scope.respuesta.banderaError=false;
            $scope.respuesta.banderaSuccess=false;
            $scope.calcularMesesTasa();
            switch($scope.data.tipoPresente)
            {
                case "NOMINAL": $scope.convercionNominalEfectiva();break;
                case "EFECTIVO":$scope.variablesUso.porcentajeEfectivo=($scope.data.porcentaje/100); break;
            }
            $scope.equivalenciaTiemposTasa();
            switch($scope.data.tipoFuturo)
            {
                case "NOMINAL": $scope.variablesUso.Resultado=$scope.convercionEfectivaNominal()*100;break;
                case "EFECTIVO":$scope.variablesUso.Resultado=$scope.variablesUso.TasaEfectivaInicial*100; break;
            }
            $scope.variablesUso.Resultado=(($scope.variablesUso.Resultado*100)/100);
            $scope.variablesUso.Resultado=parseFloat($scope.variablesUso.Resultado.toFixed(4));
            $scope.respuesta.banderaError=false;
            $scope.respuesta.banderaSuccess=true;
            $scope.respuesta.mensajeSuccess="Datos Calculados";
            $scope.respuesta.mensajeError="";
        }
        else{
            $scope.respuesta.banderaError=true;
            $scope.respuesta.banderaSuccess=false;
        }
    }
    $scope.convercionEfectivaNominal=function(){
        return $scope.variablesUso.TasaEfectivaInicial*$scope.variablesUso.cantidadTipoPagoFuturo;
    }
    $scope.equivalenciaTiemposTasa=function(){
        switch($scope.data.formaPagoFuturo)
        {
            case "MENSUAL": $scope.variablesUso.cantidadTipoPagoFuturo=12;break;
            case "TRIMESTRAL": $scope.variablesUso.cantidadTipoPagoFuturo=4;break;
            case "SEMESTRAL": $scope.variablesUso.cantidadTipoPagoFuturo=2;break;
            case "ANUAL": $scope.variablesUso.cantidadTipoPagoFuturo=1;break;
        }
        $scope.variablesUso.TasaEfectivaInicial=Math.pow($scope.variablesUso.porcentajeEfectivo+1,$scope.variablesUso.cantidadTipoPagoPresente);
        $scope.variablesUso.TasaEfectivaInicial=Math.pow($scope.variablesUso.TasaEfectivaInicial,1/$scope.variablesUso.cantidadTipoPagoFuturo)-1;
    }
    $scope.calcularMesesTasa=function(){
        switch($scope.data.formPagoPresente)
        {
            case "MENSUAL": $scope.variablesUso.cantidadTipoPagoPresente=12;break;
            case "TRIMESTRAL": $scope.variablesUso.cantidadTipoPagoPresente=4;break;
            case "SEMESTRAL": $scope.variablesUso.cantidadTipoPagoPresente=2;break;
            case "ANUAL": $scope.variablesUso.cantidadTipoPagoPresente=1;break;
        }
    }
    $scope.convercionNominalEfectiva=function(){
        $scope.variablesUso.porcentajeEfectivo=($scope.data.porcentaje/100)/$scope.variablesUso.cantidadTipoPagoPresente;
    }
    $scope.validarDatosIngreso=function()
    {
        if  ($scope.data.porcentaje!=undefined)
        {
            if ($scope.data.porcentaje==0)
            {
                $scope.respuesta.mensajeError="El porcentaje no puede ser 0.";
                return false;
            }
        }
        else{
            $scope.respuesta.mensajeError="Debe Digitar el porcentaje.";
            return false;
        }
        if  ($scope.data.tipoPresente!=undefined)
        {
            if ($scope.data.tipoPresente=="")
            {
                $scope.respuesta.mensajeError="El Tipo Presente no puede estar vacio.";
                return false;
            }
        }
        else{
            $scope.respuesta.mensajeError="Debe seleccionar el tipo presente.";
            return false;
        }
        if  ($scope.data.formPagoPresente!=undefined)
        {
            if ($scope.data.formPagoPresente=="")
            {
                $scope.respuesta.mensajeError="El forma de pago presente no puede estar vacio.";
                return false;
            }
        }
        else{
            $scope.respuesta.mensajeError="Debe seleccionar el forma de pago presente.";
            return false;
        }
        
        if  ($scope.data.tipoFuturo!=undefined)
        {
            if ($scope.data.tipoFuturo=="")
            {
                $scope.respuesta.mensajeError="El tipo futuro  no puede estar vacio.";
                return false;
            }
        }
        else{
            $scope.respuesta.mensajeError="Debe seleccionar el tipo futuro.";
            return false;
        }
        if  ($scope.data.formaPagoFuturo!=undefined)
        {
            if ($scope.data.formaPagoFuturo=="")
            {
                $scope.respuesta.mensajeError="El forma de pago futuro no puede estar vacio.";
                return false;
            }
        }
        else{
            $scope.respuesta.mensajeError="Debe seleccionar la forma de pago futuro.";
            return false;
        }
        return true;
    }
    $scope.InvertirTasa=function(){
        $scope.respuesta=[];
        $scope.respuesta.banderaError=false;
        $scope.respuesta.mensajeError="";
        $scope.respuesta.banderaSuccess=false;
        $scope.respuesta.mensajeSuccess="";
        $scope.copyData=[]
        $scope.copyData.porcentaje=$scope.data.porcentaje;
        $scope.copyData.tipoPresente=$scope.data.tipoPresente;
        $scope.copyData.formPagoPresente=$scope.data.formPagoPresente;
        $scope.copyData.tipoFuturo=$scope.data.tipoFuturo;
        $scope.copyData.formaPagoFuturo=$scope.data.formaPagoFuturo;
        $scope.data=[];
        $scope.data.porcentaje=$scope.variablesUso.Resultado;
        $scope.data.tipoPresente=$scope.copyData.tipoFuturo;
        $scope.data.formPagoPresente=$scope.copyData.formaPagoFuturo;
        $scope.data.tipoFuturo=$scope.copyData.tipoPresente;
        $scope.data.formaPagoFuturo=$scope.copyData.formPagoPresente;
        $scope.variablesUso=[];
        $scope.Calcular();
    }
    $scope.Nueva=function(){
        $scope.respuesta=[];
        $scope.respuesta.banderaError=false;
        $scope.respuesta.mensajeError="";
        $scope.respuesta.banderaSuccess=false;
        $scope.respuesta.mensajeSuccess="";
        $scope.variablesUso=[];
        $scope.data=[];
    }

});