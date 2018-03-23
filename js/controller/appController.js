var app = angular.module("CalculosFinancieros", []);

app.controller("appController", function($scope) {
    $scope.data=[];
    $scope.respuesta=[];
    $scope.respuesta.banderaError=false;
    $scope.respuesta.mensajeError="";
    $scope.respuesta.banderaSuccess=false;
    $scope.respuesta.mensajeSuccess="";
    $scope.Calcular=function()
    {
        if($scope.validarDatosIngreso())
        {
            $scope.respuesta.banderaError=false;
            $scope.respuesta.banderaSuccess=false;
            $scope.variablesUso=[];
            
        }
        else{
            $scope.respuesta.banderaError=true;
            $scope.respuesta.banderaSuccess=false;
        }
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
    }
});